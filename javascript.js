

let incomeRadio = document.querySelector("input[id='income']");
incomeRadio.checked = true;
let costRadio = document.querySelector("input[id='cost']");
let amountRadio = document.querySelector("input[id='amount']");
let dayRadio = document.querySelector("input[id='day']");
let monthRadio = document.querySelector("input[id='month']");
let yearRadio = document.querySelector("input[id='year']");
let explainRadio = document.querySelector("input[id='explain']");
let cols = ["amount", "date", "costType", "explain", "key"];

document.querySelector("form").addEventListener("submit", function (event) {
    event.preventDefault();

    if (isNaN(Number(amountRadio.value))) return alert("مبلغ را به درستی وارد کنید");
    else if ((isNaN(Number(dayRadio.value)) || dayRadio.value == "") ||
        (isNaN((Number(monthRadio.value)) || monthRadio.value == "")) ||
        (isNaN(Number(yearRadio.value)) || yearRadio.value == "")) return alert("تاریخ را به درستی وارد کنید");

    let key = Date.now().toString();
    let array = [ 
        Number(amountRadio.value),(yearRadio.value + "/" + monthRadio.value + "/" + dayRadio.value),
        (incomeRadio.checked ? "درآمد" : "هزینه"), explainRadio.value, key
    ];
    localStorage.setItem(key, array.join(","));
    table.refreshTable();

})


amountRadio.addEventListener("keyup", function (event) {
    let num = !isNaN(Number(event.target.value)) ? PersianTools.numberToWords(Number(event.target.value)) : ""
    document.querySelector(".persian-text-number").innerHTML = num;
})


class Table {

    constructor(division) {
        this.division = division;
        this.createTable()
    }

    createTable() {

        this.division.innerHTML =
            `<table class="content-table">
                <thead>
                    <tr>
                    <th></th>
                    <th>توضیحات</th>
                    <th>نوع هزینه</th>
                    <th>تاریخ</th>
                    <th>مبلغ</th>
                    <th>ردیف</th>
                    </tr>
                </thead>
                <tbody></tbody>
            </table>`;
        this.contentTableBoy = document.querySelector(".content-table > tbody");

    }

    addRow(array, index) {

        
        let key = array[cols.indexOf("key")];
        let tr = document.createElement("tr");
        let tdbtn = document.createElement("td");

        let btnShow = document.createElement("button");
        btnShow.setAttribute("type", "button")
        btnShow.innerHTML = "نمایش";
        btnShow.classList.add(...["show", "btn", "btn-primary", "btn-sm"])

        let btnRemove = document.createElement("button");
        btnRemove.setAttribute("type", "button")
        btnRemove.innerHTML = "حذف";
        btnRemove.classList.add(...["remove", "btn", "btn-danger", "btn-sm"])
        tdbtn.appendChild(btnShow)
        tdbtn.appendChild(btnRemove);
        tr.appendChild(tdbtn);


        ["explain", "costType", "date", "amount", "row"].forEach(element => {
            
            let td = document.createElement("td");
            if (element == "row") td.innerHTML = index;
            else td.innerHTML = array[cols.indexOf(element)];
            tr.appendChild(td)
        });
        this.contentTableBoy.appendChild(tr);
        btnRemove.addEventListener("click", this.removeRow.bind(this, key))
        btnShow.addEventListener("click", (event) => { this.showDetail.bind(event.target, key)() })

    }

    removeRow(key) {

        localStorage.removeItem(key)
        this.refreshTable();
    }

    showDetail(key) {

        let dataArray = Object.entries(localStorage).map(([key, value]) => value.split(","));
        let data = null;
        dataArray.forEach((item) => {
            if (item[cols.indexOf("key")] == key) data = item;
        })
        
        document.querySelector(".modal-div").innerHTML = `
        <div class="modal fade" id="exampleModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
          <div class="modal-dialog">
            <div class="modal-content">
              <div class="modal-header">
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div class="modal-body modal-body-custom">
              <div>مبلغ: ${data[cols.indexOf("amount")]}</div>
              <div>تاریخ: ${data[cols.indexOf("date")]}</div>
              <div>نوع هزینه: ${data[cols.indexOf("costType")]}</div>
              <div>${data[cols.indexOf("explain")]} :توضیحات</div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                </div>
            </div>
          </div>
          </div>`;

        window.myModal = new bootstrap.Modal(document.querySelector('.modal'), {})
        myModal.show();

    }

    refreshTable() {
        this.contentTableBoy.innerHTML = "";
        
        let data = Object.entries(localStorage).map(([key, value]) => value.split(","));
        data.forEach((row, index) => { table.addRow(row, index + 1); });
        window.myChart = renderChart();
        
        document.querySelector(".income-sum").innerHTML = setIncomeSum();
        document.querySelector(".cost-sum").innerHTML= setCostSum();
    }
}

let tableDiv = document.querySelector(".table-part");
let table = new Table(tableDiv);

table.refreshTable();

function renderChart() {
    
    let data = Object.entries(localStorage).map(([key, value]) => value.split(","));

    let sortData = data.sort((a, b) => {

        let aArray = a[cols.indexOf("date")].split("/").map(elem => Number(elem));
        let bArray = b[cols.indexOf("date")].split("/").map(elem => Number(elem));

        if (aArray[0] !== bArray[0]) return aArray[0] - bArray[0]
        else if (aArray[1] !== bArray[1]) return aArray[1] - bArray[1]
        else return aArray[2] - bArray[2]

    })

    let dataAmountIncome = sortData.filter((elem, index) => elem[cols.indexOf("costType")] == "درآمد");
    let dataIncome = dataAmountIncome.map((elem, index) => elem[cols.indexOf("amount")]);
    let dataAmountCost = sortData.filter((elem, index) => elem[cols.indexOf("costType")] == "هزینه");
    let dataCost = dataAmountCost.map((elem, index) => elem[cols.indexOf("amount")]);

    let labels = removeDuplicates(sortData.map((elem, index) => elem[cols.indexOf("date")]));

    function removeDuplicates(arr) {
        return arr.filter((item, index) => arr.indexOf(item) === index);
    }

    var ctx = document.querySelector('.myChart').getContext('2d');

    myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'درآمد',
                data: dataIncome,
                borderColor: "green",
    
            }, {
                label: 'هزینه',
                data: dataCost,
                borderColor: "red",
         
            },]
        },
    });
    return myChart;
}


function setIncomeSum() {

    let data = Object.entries(localStorage).map(([key, value]) => value.split(","));
    let dataIncome = data.filter((elem, index) => elem[cols.indexOf("costType")] == "درآمد");
    let dataamount = dataIncome.map((elem, index) => elem[cols.indexOf("amount")]);
    let sum = 0;
    dataamount.forEach((elem, index) => sum += Number(elem));
    return sum;
}

function setCostSum() {

    let data = Object.entries(localStorage).map(([key, value]) => value.split(","));
    let dataCost = data.filter((elem, index) => elem[cols.indexOf("costType")] == "هزینه");
    let dataamount = dataCost.map((elem, index) => elem[cols.indexOf("amount")]);
    let sum = 0;
    dataamount.forEach((elem, index) => sum += Number(elem));
    return sum;
}

















