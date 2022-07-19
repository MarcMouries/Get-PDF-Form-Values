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
        // Load a PDF with form fields
        const pdfDoc = await PDFDocument.load(formPdfBytes)

        // Get the form containing all the fields
        const form = pdfDoc.getForm();
        return form;
    } catch (error) {
        throw new Error(error)
    }
}


const list_PDF_Form_Fields = async (file_path) => {
    const form = await getPDF_Form(file_path);
    const fields = form.getFields();
    console.log("╔════════════════════════════════╦════════════════╦════════════════════╗")
    console.log("║ Field Name                     ║  Field Type    ║  Notes             ║");
    console.log("╠════════════════════════════════╬════════════════╬════════════════════╣")
    fields.forEach(field => {
        const field_name = field.getName()
        const field_type = field.constructor.name;
        let to_print = "║ " + field_name.padEnd(30, ' ') + " ║ " + field_type.substring(3).padEnd(15, ' ') + "║ ";

        if (field_type == 'PDFDropdown') {
            const selections = field.getSelected()
            to_print  += 'Multiselect:' + field.isMultiselect();
        }
        console.log(to_print.padEnd(71, ' ') + "║ ")
    })
    console.log("╚════════════════════════════════╩════════════════╩════════════════════╝");
}


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
