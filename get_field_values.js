const fs = require('fs')

const { PDFDocument } = require('pdf-lib');
const { exit } = require('process');


if (process.argv.length != 3) {
    console.error("Error: Missing path of PDF file to get the form values from.")
    exit(999);
}
const file_path = process.argv[2];

// const pdf_file_path = '/Users/marc.mouries/Library/CloudStorage/OneDrive-ServiceNow/Accounts/NOAA_Read-PDF/Nomination_form_FILLED.pdf'

console.log("Reading file: " + file_path);

const field_names = [
    'Last', 
    'Email Address',
    'Home Phone',
    'Male'
]

var result = {};

const getPDF_Form_Values = async (file_path) => {
    let formPdfBytes = fs.readFileSync(file_path)
    try {
        // Load a PDF with form fields
        const pdfDoc = await PDFDocument.load(formPdfBytes)

        // Get the form containing all the fields
        const form = pdfDoc.getForm();

        /*
        const fields = form.getFields()
        fields.forEach(field => {
            const type = field.constructor.name
            const name = field.getName()
            console.log(`${type}: '${name}'`)
        })
*/
        field_names.forEach(field_name => {
            let field = form.getField(field_name);
            let type = field.constructor.name;
           // console.log('Field type = ', type);

            if (type == 'PDFTextField' ) {
                console.log('Field value = ', field.getText())
                result[field_name] = field.getText();

            }
            else if (type == 'PDFCheckBox' ) {
                console.log('Field value = ', field.isChecked())
                result[field_name] = field.isChecked();

            }
            else {
                console.log('NEED TO HANDLE field of type:', type)

            }

        })

        console.log(result)


           const field_Email_Address = form.getTextField('Email Address')
           console.log('Text field contents:', field_Email_Address.getText())


    } catch (error) {
        throw new Error(error)
    }
}
getPDF_Form_Values(file_path)