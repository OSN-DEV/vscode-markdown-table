import * as vscode from 'vscode';
import * as text from './textUtility';
import * as mtdh from './markdownTableDataHelper';
import { StringBuilder } from './StringBuilder';
import * as path from 'path';
import * as fs from 'fs';
import { Uri } from 'vscode';


// 参考
// https://code.visualstudio.com/api/extension-guides/webview
let panel: vscode.WebviewPanel | null = null
let editor : vscode.TextEditor | null = null

export function editTable(extensionUri: Uri, sbuscriptions:  { dispose(): any }[]) {

  editor = vscode.window.activeTextEditor as vscode.TextEditor;     // エディタ取得
  const doc = editor.document;                                            // ドキュメント取得
  const cur_selection = editor.selection;                                 // 選択範囲取得

  // 表を探す
  const tableRange = text.findTableRange(doc.getText(), cur_selection.anchor.line, cur_selection.anchor.line);
  if (!tableRange) {
    return;
  }
  const [startLine, endLine] = tableRange;
  const table_selection = new vscode.Selection(startLine, 0, endLine, 10000);
  const table_text = doc.getText(table_selection);

  // 元のカーソル位置を取得
  const [prevline, prevcharacter] = [cur_selection.active.line - startLine, cur_selection.active.character];

  // テーブルをTableDataにシリアライズ
  let tableData = mtdh.stringToTableData(table_text);
  if (tableData.aligns[0][0] === undefined) {
    return;
  }

  panel = vscode.window.createWebviewPanel(
    'editMarkdownTable',
    'Edit Markdown Table',
    vscode.ViewColumn.Beside,
    {
      enableScripts: true,
      localResourceRoots: [Uri.joinPath(extensionUri, 'src', 'assets')]
    }
  );

  const mainCssUri = panel.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'src', 'assets', 'styles.css'));
  const resetCssUri = panel.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'src', 'assets', 'reset.css'));
  const scriptUri = panel.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'src', 'assets', 'script.js'));
  panel.webview.html = getWebviewContent(tableData.cells)
    .replace('@resetCss@', resetCssUri.toString())
    .replace('@mainCss@', mainCssUri.toString())
    .replace('@scriptUri@', scriptUri.toString())
    .replaceAll('@nonce@', getNonce())
    .replaceAll('@csp@', panel.webview.cspSource)

  panel.webview.onDidReceiveMessage((message) => {
    console.log("onDidReceiveMessage")

    switch(message.command) {
      case 'cancel':
        panel?.dispose()
        break
      case 'complete':
        const lines = tableData.originalText.split(/\r\n|\n|\r/);
        let baseData = `${lines[0]}\r\n${lines[1]}\r\n${message.data.join('\r\n')}`
        const tmpTable = mtdh.stringToTableData(baseData)
      //エディタ選択範囲にテキストを反映
      editor?.edit(edit => {
        edit.replace(table_selection, mtdh.toFormatTableStr(tmpTable));
      }); 
      panel?.dispose()
      break
    }
  },undefined, sbuscriptions)
}
        

function getWebviewContent(table: string[][]): string {
  const html = new StringBuilder()
  // html.append('<!DOCTYPE html>')
  // html.append('<html lang="en">')
  // html.append('<head>')
  // html.append('  <meta charset="UTF-8">')
  // html.append(`  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src @csp@; script-src 'nonce-@nonce@';">`)
  // html.append('  <meta name="viewport" content="width=device-width, initial-scale=1.0">')
  // html.append(`  <link rel="stylesheet" href="@resetCss@">`)
  // html.append(`  <link rel="stylesheet" href="@mainCss@">`)
  // html.append('  <title>Edit Markdown Table</title>')
  // html.append('</head>')
  // html.append('<body>')
  // html.append('<table border cellspacing="0" id="tbl">')
  // table.forEach((row: string[], rowIndex: number) => {
  //   html.append('<tr>')
  //   row.forEach((value: string, colIndex: number) => {
  //     html.append(`<td contenteditable="true">${value}</td>`)
  //   })
  //   html.append('</tr>')
  // })
  // html.append('</table>')
  // html.append('<button id="btn" nonce="nonce-@nonce@">Complete</button>')
  // html.append('<div id="app" />')
  // html.append('<script nonce="@nonce@" src="@scriptUri@">')
  // html.append('</script>')
  // html.append('</body>')
  // html.append('</html>')


  html.append(`
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src @csp@; script-src 'nonce-@nonce@';">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link rel="stylesheet" href="@resetCss@">
      <link rel="stylesheet" href="@mainCss@">
      <title>Edit Markdown Table</title>
    </head>
    <body>
      <div class="table-container">
      <table border cellspacing="0" id="tbl">
      <tbody>
    `)

  table.forEach((row: string[], rowIndex: number) => {
    html.append('<tr>')
    row.forEach((value: string, colIndex: number) => {
      html.append(`<td contenteditable="true">${value}</td>`)
    })
    html.append('</tr>')
  })

  html.append(
   `
    </tbody>
    </table>
    <div class="resizer"></div>
    </div>
    <br/>
    <button id="complete" nonce="nonce-@nonce@">Complete</button>
    <button id="cancel" nonce="nonce-@nonce@">Cancel</button>
    <div id="app" />
    <script nonce="@nonce@" src="@scriptUri@"></script>
  </body>
  </html>`
  )




  return html.toString()
}

function getNonce() {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}
