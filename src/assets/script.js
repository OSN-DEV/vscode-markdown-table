function complete(){
    console.log('complete')
    // 返却データの作成
    const data = []
    var table = document.getElementById('tbl')
    var rowCount = table.ariaRowSpan.length
    for(let i=0; i < rowCount; i++) {}

    const vscode = acquireVsCodeApi();
    vscode.postMessage({
        command: "complete",
        data: data
    },"*")
    console.log('send!!!!!!!!')
}

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('btn').addEventListener('click', complete)
})