function complete(){
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
    });``

    // 返却データの送信
    const vscode = acquireVsCodeApi();
    vscode.postMessage({
        command: "complete",
        data: data
    },"*")
}

function cancel(){
    const vscode = acquireVsCodeApi();
    vscode.postMessage({
        command: "cancel"
    },"*")
}

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('complete').addEventListener('click', complete)
    document.getElementById('cancel').addEventListener('click', cancel)
})

document.addEventListener('DOMContentLoaded', function() {
    const tableContainer = document.querySelector('.table-container');
    const resizer = document.querySelector('.resizer');
    let startX;
    let startWidth;

    resizer.addEventListener('mousedown', function(e) {
        startX = e.pageX;
        startWidth = parseInt(document.defaultView.getComputedStyle(tableContainer).width, 10);
        document.documentElement.addEventListener('mousemove', mouseMoveHandler);
        document.documentElement.addEventListener('mouseup', mouseUpHandler);
    });

    function mouseMoveHandler(e) {
        const newWidth = startWidth + (e.pageX - startX);
        if ((newWidth > 0)) {  // resizerがテーブルの幅より左側に移動しないようにする
            tableContainer.style.width = newWidth + 'px';

            // スクロール位置を調整
            if (e.pageX > window.innerWidth) {
                window.scrollBy(e.pageX - window.innerWidth, 0);
            } else if (e.pageX < 0) {
                window.scrollBy(e.pageX, 0);
            }
        }
    }

    function mouseUpHandler() {
        document.documentElement.removeEventListener('mousemove', mouseMoveHandler);
        document.documentElement.removeEventListener('mouseup', mouseUpHandler);
    }

});

