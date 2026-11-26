"""Opt-in local platform API. Run with synthetic data on loopback."""

import logging
import os
from contextlib import asynccontextmanager
from dataclasses import dataclass
from pathlib import Path
from sqlite3 import Error as DatabaseError
from typing import Annotated, Literal

from fastapi import Depends, FastAPI, HTTPException, Path as PathParam, Request, Response
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from pydantic import BaseModel, ConfigDict, StringConstraints

from .local_store import LocalStore, utc_timestamp

logger = logging.getLogger(__name__)
Identifier = Annotated[str, StringConstraints(min_length=1, max_length=96, pattern=r"^[A-Za-z0-9_-]+$")]
ResourceId = Annotated[Identifier, PathParam(description="Versioned catalog resource identifier")]


@dataclass(frozen=True)
class Principal:
    """Identity and roles validated by an upstream adapter."""

    subject: str
    admin: bool = False


def resolve_principal() -> Principal | None:
    return None


class ResourceSummary(BaseModel):
    id: str
    title: str
    access: str


class ResourceContent(ResourceSummary):
    payload: str


class Bookmark(BaseModel):
    model_config = ConfigDict(extra="forbid")
    stage: Identifier


class Acceptance(BaseModel):
    model_config = ConfigDict(extra="forbid")
    version: Identifier


def create_app(store: LocalStore | None = None, *, clock=utc_timestamp):
    if store is None:
        db_path = os.environ.get("D2R_LOCAL_DB")
        if not db_path:
            raise ValueError("D2R_LOCAL_DB is required for the opt-in local API")
        store = LocalStore(Path(db_path))

    @asynccontextmanager
    async def lifespan(_app):
        store.migrate()
        yield

    app = FastAPI(title="Digital2Real local platform contracts", version="0.1.0", lifespan=lifespan)

    @app.middleware("http")
    async def disable_shared_caching(request: Request, call_next):
        response = await call_next(request)
        response.headers["Cache-Control"] = "private, no-store"
        return response

    @app.exception_handler(RequestValidationError)
    async def invalid_request(request, error):
        return JSONResponse({"code": "invalid_request"}, status_code=422)

    @app.exception_handler(DatabaseError)
    async def unavailable(request, error):
        logger.warning("Local platform database operation failed")
        return JSONResponse({"code": "service_unavailable"}, status_code=503)

    def account(principal: Annotated[Principal | None, Depends(resolve_principal)]) -> Principal | None:
        if principal is None or not store.user_exists(principal.subject):
            return None
        return principal

    def require_account(principal: Annotated[Principal | None, Depends(account)]) -> Principal:
        if principal is None:
            raise HTTPException(401, "Authentication required")
        return principal

    @app.get("/health/live")
    def live():
        return {"status": "ok"}

    @app.get("/health/ready")
    def ready():
        store.ready()
        return {"status": "ready"}

    @app.get("/api/v1/catalog", response_model=list[ResourceSummary])
    def catalog(principal: Annotated[Principal | None, Depends(account)]):
        subject = principal.subject if principal else None
        rows = store.resources(subject, bool(principal and principal.admin), clock())
        return [dict(row) for row in rows]

    @app.get("/api/v1/resources/{resource_id}", response_model=ResourceContent)
    def content(resource_id: ResourceId, principal: Annotated[Principal | None, Depends(account)]):
        subject = principal.subject if principal else None
        rows = store.resources(subject, bool(principal and principal.admin), clock(), resource_id)
        if not rows:
            raise HTTPException(404, "Resource unavailable")
        return dict(rows[0])

    @app.put("/api/v1/me/practice/{experience_id}", status_code=204)
    def bookmark(experience_id: ResourceId, body: Bookmark,
                 principal: Annotated[Principal, Depends(require_account)]):
        # Practice bookmarks are user notes. They carry no assessment authority.
        store.save_bookmark(principal.subject, experience_id, body.stage)
        return Response(status_code=204)

    @app.get("/api/v1/legal/{document_id}")
    def legal_document(document_id: ResourceId, locale: Literal["es", "en"] = "es"):
        row = store.document(document_id, clock())
        if row is None:
            raise HTTPException(404, "Document unavailable")
        return {"id": row["document"], "version": row["version"], "locale": locale,
                "effective_at": row["effective_at"], "text": row[locale]}

    @app.put("/api/v1/me/legal/{document_id}", status_code=204)
    def accept(document_id: ResourceId, body: Acceptance,
               principal: Annotated[Principal, Depends(require_account)]):
        if not store.accept(principal.subject, document_id, body.version, clock()):
            raise HTTPException(409, "Document version unavailable")
        return Response(status_code=204)

    @app.get("/api/v1/me/export")
    def export(principal: Annotated[Principal, Depends(require_account)]):
        return store.export(principal.subject)

    return app
