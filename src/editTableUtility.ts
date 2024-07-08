import * as vscode from 'vscode';


export function editTable() {

    const panel = vscode.window.createWebviewPanel(
        'editMarkdownTable',
        'Edit Markdown Table',
        vscode.ViewColumn.One,
        {
          enableScripts: true
        }
      );
      
      const markdownTable = getSelectedMarkdownTable()
      panel.webview.html = getWebviewContent(markdownTable);
      
    // const editor = vscode.window.activeTextEditor;
    // if (!editor) {
    //   return '';
    // }
  
    // const selection = editor.selection;
    // return editor.document.getText(selection);
}

function getSelectedMarkdownTable(): string {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return '';
    }
  
    const selection = editor.selection;
    return editor.document.getText(selection);
  }

function getWebviewContent(table: string): string {
    // ここでHTMLとJavaScriptを返す。ここでは簡単な例を示します。
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Edit Markdown Table</title>
      </head>
      <body>
        Hello World!!!!
        <div id="table-editor"></div>
        <script>
          const table = \`${table}\`;
  
          // tableをHTMLのテーブルに変換して表示するコードをここに追加
  
          // VS Code APIと連携する例
          const vscode = acquireVsCodeApi();
        </script>
      </body>
      </html>
    `;
  }