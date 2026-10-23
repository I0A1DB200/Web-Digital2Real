# EE-0013 media provenance

All seven final PNGs were generated for EE-0013 using the built-in image generation workflow. These are synthetic engineering illustrations, not actual plant captures or manufacturer software screenshots. Rights/technical review remains part of the package's technical-review status.

The reusable Asset Library catalog contained no candidates. EE-0011/0012 and EE-0004 were inspected as repository references. EE-0004 assets 02/04/07 were initially considered for direct reuse but rejected during final case review: the PLC addresses/CPU, numerical pressure and different recovery composition would add unsupported facts. No final asset is a byte-identical cross-Experience copy. Reference reuse is visual only.

No external manufacturer image was copied into this package.

## Final generation brief / prompt set

| Asset | Reference and generation instructions |
|---|---|
| 01-cover.png | EE-0004/01.png: same packaging-station photographic treatment, cylinder retracted, waiting box, local disconnected fitting hidden, no text or overlay. |
| 02-incident.png | EE-0004/01.png: incident composition with waiting box and fully retracted rod, no visible fault, no text/diagram. |
| 03-plc-command.png | Realistic TIA Portal-style laptop watch table; exact rows ExtendCmd / Bool / TRUE, ExtendOutput / Bool / TRUE, ExtendedLS / Bool / FALSE. No addresses, CPU model, pressure, safety tags or diagnostic claims. |
| 04-air-supply.png | ART-002: close-up of air preparation and connected valve assembly; cylinder/local fittings cropped out, gauge unreadable, no numerical pressure claim or added labels. |
| 05-disconnected-line.png | EE-0004/06.png: local cylinder-side blue tube visibly out of its push-in fitting, visible gap and open end, no hands or repair, no labels. |
| 06-reconnection.png | ART-005: gloved hands reseating the same tube, preserve fitting and background, no extension, successful movement, feedback or recovery. |
| 07-verification.png | ART-002: preserve cylinder body/mounting and camera orientation; extend rod to the left, move pusher and box with it; no feedback indicator or text added. |

The exact original prompt text is preserved in the task tool-call history. Selected built-in output filenames: cover `exec-d75d511f-6c10-478f-91fd-fe220dcd199f.png`; incident `exec-ab9573d6-bf9b-4c27-b7a1-0c1ab3b935e4.png`; PLC `exec-685cde2f-990f-4e1e-90c6-8458f94ca1b1.png`; supply `exec-f3eae4cc-a1ef-42be-9a9b-0b6f013fd728.png`; disconnection `exec-0b50f62e-fefd-4534-8842-3598fda9f5aa.png`; reconnection `exec-1798322f-c0eb-4b93-8bd5-7f75eb804747.png`; recovery `exec-89a50883-af49-4933-82a2-be02002856f8.png`. Final project assets live in the package's `assets/` directory; no runtime dependency on generation storage exists.
