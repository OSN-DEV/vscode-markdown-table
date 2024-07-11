function complete(){
    // 返却データの作成
    const data = []
    let rowData = []
    const  table = document.getElementById('tbl')
    const rows = Array.from(table.getElementsByTagName('tr'))
    rows.forEach(row => {
        rowData = []
        const cells = Array.from(row.getElementsByTagName('td'))
        cells.forEach(cell => {
            rowData.push(cell.innerText.replace(/\r\n|\n|\r/, '<br/>'))
        })
        data.push(`|${rowData.join('|')}|`)
    });

    // 返却データの送信
    const vscode = acquireVsCodeApi();
    vscode.postMessage({
        command: "complete",
        data: data
    },"*")
}

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('btn').addEventListener('click', complete)
})