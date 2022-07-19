# PDF-Form-Reader

Reads a PDF form document and prints the list of fields with their types and their values.

Uses the library https://pdf-lib.js.org/ 


## Usage
```
Usage:
  node get_field_values.js  --types <pdf file path>
  node get_field_values.js  --values <pdf file path>

Example:

node get_field_values.js --types ./samples/pdfFormExample.pdf

node get_field_values.js --values ./samples/pdfFormExample.pdf

```