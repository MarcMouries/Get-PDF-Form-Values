const fs = require('fs')

const { PDFDocument } = require('pdf-lib');
const { exit } = require('process');

function print_usage() {
    console.error("Usage:")
    console.error("  node get_field_values.js  --types <pdf file path>    ")
    console.error("  node get_field_values.js  --values <pdf file path>    ")
}


const getPDF_Form = async (file_path) => {
    console.log("Reading file: " + file_path);

    let formPdfBytes = fs.readFileSync(file_path)
    try {
        const pdfDoc = await PDFDocument.load(formPdfBytes)
        const form = pdfDoc.getForm();
        return form;
    } catch (error) {
        throw new Error(error)
    }
}


const list_PDF_Form_Fields = async (file_path) => {
    const form = await getPDF_Form(file_path);
    const fields = form.getFields();

    // Column widths remain the same
    const numColumnWidth = 5;
    const nameColumnWidth = 34;
    const typeColumnWidth = 15;
    const notesColumnWidth = 20;

    console.log(`╔${'═'.repeat(numColumnWidth)}╦${'═'.repeat(nameColumnWidth)}╦${'═'.repeat(typeColumnWidth)}╦${'═'.repeat(notesColumnWidth)}╗`);
    console.log(`║ ${' '.repeat(numColumnWidth - 3)}# ║ Field Name${' '.repeat(nameColumnWidth - 11)}║ Field Type${' '.repeat(typeColumnWidth - 11)}║ Notes${' '.repeat(notesColumnWidth - 6)}║`);
    console.log(`╠${'═'.repeat(numColumnWidth)}╬${'═'.repeat(nameColumnWidth)}╬${'═'.repeat(typeColumnWidth)}╬${'═'.repeat(notesColumnWidth)}╣`);

    fields.forEach((field, index) => {
        const fieldNameLines = wrapText(field.getName(), nameColumnWidth - 6); // Adjusting for padding correctly
        const fieldTypeText = field.constructor.name.substring(3);
    
        fieldNameLines.forEach((line, lineIndex) => {
            const numField = lineIndex === 0 ? ` ${String(index + 1)}` : ' ';     
            const nameField = ` ${line.padEnd(nameColumnWidth - 6)} `;
    
            const typeField = lineIndex === 0 
                ? ` ${fieldTypeText.padEnd(typeColumnWidth - 6)} ` 
                : ' '.repeat(typeColumnWidth);
    
            const notesField = ' '.repeat(notesColumnWidth - 1);
    
            console.log(`║${numField.padEnd(numColumnWidth)}║${nameField.padEnd(nameColumnWidth)}║${typeField.padEnd(typeColumnWidth)}║${notesField.padEnd(notesColumnWidth)}║`);
        });
    });
    
    
    console.log(`╚${'═'.repeat(numColumnWidth)}╩${'═'.repeat(nameColumnWidth)}╩${'═'.repeat(typeColumnWidth)}╩${'═'.repeat(notesColumnWidth)}╝`);
};







const list_PDF_Form_Values = async (file_path) => {
    var result = {};

    const form = await getPDF_Form(file_path);
    const fields = form.getFields()

    fields.forEach(field => {
        const field_name = field.getName()
        const type = field.constructor.name

        if (type == 'PDFTextField') {
            result[field_name] = field.getText();
        }
        else if (type == 'PDFCheckBox') {
            result[field_name] = field.isChecked();
        }
        else if (type == 'PDFDropdown') {
            const selections = field.getSelected();
            if (! field.isMultiselect()) {
                let selected_value = selections[0];
                result[field_name] = selected_value;
            }
            else {
                result[field_name] = field.getSelected();
            }
        }
        else if (type == 'PDFRadioGroup') {
            result[field_name] = field.getSelected();
        }
        else if (type == 'PDFOptionList') {
            result[field_name] = field.getSelected();
        }
        else {
            console.log('Type is undefined for field:', field_name)
        }
    })
    console.log(JSON.stringify(result, null, 4))
}


if (process.argv.length == 2) {
    print_usage();
    exit(999);
}

const option = process.argv[2];
if (option == "--types" && process.argv.length == 4) {
    console.log("list all the fields and their type");
    const file_path = process.argv[3];
    list_PDF_Form_Fields(file_path)
}
else if (option == "--values" && process.argv.length == 4) {
    console.log("list all the fields and their value");
    const file_path = process.argv[3];
    list_PDF_Form_Values(file_path)
} else {
    print_usage();
    exit(999);
}

const wrapText = (text, maxLineLength) => {
    const words = text.split(' ');
    const lines = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
        if (currentLine.length + words[i].length + 1 <= maxLineLength) {
            currentLine += ' ' + words[i];
        } else {
            lines.push(currentLine);
            currentLine = words[i];
        }
    }
    lines.push(currentLine);

    return lines;
};
