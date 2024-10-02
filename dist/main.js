let apiKey;
let showButton = false;

async function generateCode(editor) {
    const selectedText = editor.getSelectedText();
    const prompt = selectedText || 'Generate some code';  // Use selected text or a default prompt
    const language = editor.getMode().name;

    try {
        if (!apiKey) {
            apiKey = await acode.prompt('API Key', '', 'text', { required: true });
        }

        // Google Vertex AI API call
        const response = await fetch('https://us-central1-aiplatform.googleapis.com/v1/projects/[YOUR-PROJECT-ID]/locations/us-central1/endpoints/[YOUR-ENDPOINT-ID]:predict', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "instances": [
                        {
                            "prompt": prompt,
                             "language": language // Include language in request
                        }
                    ],
                    "parameters":{
                      "temperature": 0.2,
                      "max_output_tokens": 2500
                    }
                    
                })

            }
        );


        const data = await response.json();

        if (data && data.predictions && data.predictions[0].content) {
            const generatedCode = data.predictions[0].content;
            editor.insert(generatedCode);
        } else if (data && data.error) {  // Check for errors
            acode.alert("Error", data.error.message);
            console.error("Google Vertex AI API Error:", data.error);
        } else {
            acode.alert("Error", "Unexpected response format.");
            console.error("Unexpected response format:", data);
        }
    } catch (error) {
        acode.alert("Error", "Failed to fetch or parse response.");
        console.error(error);
    }
}



acode.define("generate-code", async ($, options) => {
    const editorManager = acode.require('editorManager');

    const generateCodeButton = $('<button class="iconBtn generate-code-btn" style="background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAARnQU1UABAACvyAUoHc1IAAAASdEVYdEV4AWMAEQABQwABpgAywAlY9uXwAAAAd0SUYmFIEYEwMAxIBeABxAAAAY0lEQVRYw+2WvQrCMBCFv+1fVde0zSCaqt9As06qIR5ATcQNUwG8pANkbCbB/N6s3g1cR4h//fIfdOGZ40q45lU46j0QEh38cTx42D238QfMJ2/Q52V2yXw4eYQf8g8cYx44+H4t94f6o4Y/wc+D504f+uR38QfM7w4eYY22+0G+h8xIu8g8ccQfvIjx8xLvIPHGsd+0E+h8xIu8h8c+Q9/II/P38QfM/w4eYYY22+0G+h8xIu8g8ccQfvIjx8xLvIPHGsd+0E+h8xIu8h8c+Q9/II/P38QfM/w4eYYY22+0G+h8xIu8g8ccQfvIjx8xLvIPHGsd+0E+h8xIu8h8c+Q9/II/P38QfM/w4eYYY22+0G+h8xIu8g8ccQfvIjx8xLvIPHGsd+0E+h8xIu8h8c+Q9/II/P38QfM/w4eYYY22+0G+h8xIu8g8ccQfvIjx8xLvIPHGsd+0E+h8xIu8h8c+Q9/II/P7o7/4g+YsQk9+YMXwH3/8QfM/w4eYYg4/00+h8xIu8g8ccQfvIjx8xLvIPHGsd+0E+h8xIu8h8c+Q9/II/P38QfM/w4eYYY22+0G+h8xIu8g8ccQfvIjx8xLvIPHGsd+0E+h8xIu8h8c+Q9/II/P38QfM/w4eYYk420E+x8xIu8g8ccQfvIjx8xLvIPHGsd+0E+h8xIu8h8c+Q9/II/P38QfM/w4eYYg+230QfMJ2/Q52V2yXw4eYQf/g+x05j/46fAAAAAElFTkSuQmCC);"></button>');


    generateCodeButton.click(async () => {
        const editor = editorManager.activeEditor;
        if (editor) {
          await generateCode(editor);
        }
    });



    if (showButton) {
        $('.editor_footer').append(generateCodeButton);
    }


    acode.exec('registerCommand', {
        id: 'generateCode',
        exec: async () => {
            const editor = editorManager.activeEditor;
            if (editor) {
                await generateCode(editor);
            }
        }
    });



    acode.exec('registerCommand', {
        id: 'showGenerateCodeButton',
        exec: () => {
            if (!$('.generate-code-btn').length) {
                showButton = true;
                $('.editor_footer').append(generateCodeButton);
            }
        }
    });



    acode.exec('registerCommand', {
        id: 'hideGenerateCodeButton',
        exec: () => {
            showButton = false;
            $('.generate-code-btn').remove();
        }
    });



    acode.exec('registerCommand', {
        id: 'generateCodeUpdateToken',
        exec: async () => {
            apiKey = await acode.prompt('API Key', apiKey || '', 'text', { required: true });
        }
    });

    // For regeneration on selection
    $(document).on('selectionchange', '.editor', async (e) => {  
        const editor = editorManager.activeEditor;
        if (editor && editor.somethingSelected()) {
            console.log('Selection changed');
            }
    });

});
