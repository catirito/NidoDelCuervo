# Nido del Cuervo

A simple web application for browsing and managing tabletop role-playing characters.

**[Visit the website](https://nido-del-cuervo.pages.dev)**

Search, filter, and sort the character roster, or edit character names, levels, notes, status, owners, classes, subclasses, and species. Ranks update automatically based on level, and changes are saved together with conflict detection. Class, subclass, and species selectors support adding new options, with subclasses linked to their class.

Use **Exportar Excel** beside **Editar** to download all saved characters with the nine table fields and the active sort order, regardless of filters. The Excel file is generated in your browser and downloaded to your device; it is not stored on the server. Export is disabled while editing. Export queries the complete saved roster, including characters outside the current page.

Built with HTML, CSS, and vanilla JavaScript, with responsive layouts and light and dark themes. Hosted on Cloudflare Pages, using Pages Functions for the API and Cloudflare D1 for persistent storage. The original Excel workbook is preserved privately as a read-only import source and historical reference.
