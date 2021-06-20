
let $ = require('jquery');
let fs = require("fs");
let dialog = require("electron").remote.dialog;


$("document").ready(function()    
{
    //console.log("Jquery loaded !!");
    let db;  // let us take declare it globally
    let lsc;  // it will store the address of last clicked cell

    $(".new").on("click", function()
    {
        // make new Database
        db = [];   
        let allRows = $(".cells .row");
        //console.log(allRows.length);
        for(let i = 0 ; i < allRows.length; i++)
        {
            let row = [];
            let allColsInARow = $(allRows[i]).find(".cell");
            for(let j = 0; j < allColsInARow.length; j++)
            {
                let address = getAddressFromRowIdColId(i,j);
                let cellObject = {
                    name : address,
                    value : "",
                    formula : "",
                    parents : [],
                    childrens : [],
                    cellFormatting : { bold : false , underline : false , italic : false},
                    cellAlignment : "center",
                    fontSize : "16px",
                    textColor : "black",
                    background : "white",
                    fontFamily : "none"
                }
                row.push(cellObject);
                $(allColsInARow[j]).html("");
                $(allColsInARow[j]).css("font-weight", "normal");
                $(allColsInARow[j]).css("font-style", "normal");
                $(allColsInARow[j]).css("text-decoration", "none");
                $(allColsInARow[j]).css("text-align", "center");
                $(allColsInARow[j]).css("font-size", "16px");
                $(allColsInARow[j]).css("color", "black");
                $(allColsInARow[j]).css("background", "white");
            }
            db.push(row);
        }
        $(".address, .cell-formula").val("");
        let sheet = $(".active-sheet").html();
        let splitSheetName = sheet.split(" ");
        let sheetNum = splitSheetName[1];
        let sheetNewNum = Number(sheetNum) + 1;
        let newSheetName = `Sheet ${sheetNewNum}`;
        $(".active-sheet").html(newSheetName);
    })

    $(".open").on("click", function()
    {
        let paths = dialog.showOpenDialogSync();
        let path = paths[0];
        let data = fs.readFileSync(path);
        data = JSON.parse(data);  
        db = data;

        let allRows = $(".cells .row");
        for(let i = 0 ; i < allRows.length; i++)
        {
            let allCellsInARow = $(allRows[i]).find(".cell");
            for(let j = 0 ; j < allCellsInARow.length; j++)
            {
                let value = db[i][j].value;
                $(allCellsInARow[j]).html(value);
                $(allCellsInARow[j]).css("font-weight", db[i][j].cellFormatting.bold ? "bold" : "normal");
                $(allCellsInARow[j]).css("font-style", db[i][j].cellFormatting.italic ? "italic" : "normal");
                $(allCellsInARow[j]).css("text-decoration", db[i][j].cellFormatting.underline ? "underline" : "none");
                $(allCellsInARow[j]).css("text-align", `${db[i][j].cellAlignment}`);
                $(allCellsInARow[j]).css("font-size", `${db[i][j].fontSize}`);
                $(allCellsInARow[j]).css("color", `${db[i][j].textColor}`);
                $(allCellsInARow[j]).css("background", `${db[i][j].background}`);
            }
        }
    })

    $(".save").on("click", function()
    {
        let path = dialog.showSaveDialogSync();
        let data = JSON.stringify(db);
        fs.writeFileSync(path, data);
        alert("File Saved !");
    })

    $("#file").on("click", function()
    {
        $("#home").removeClass("menu-active");
        $(".home-menu-options").removeClass("menu-options-active");
        $(this).addClass("menu-active");
        $(".file-menu-options").addClass("menu-options-active");
    })
    
    $("#home").on("click", function()
    {
        $("#file").removeClass("menu-active");
        $(".file-menu-options").removeClass("menu-options-active");
        $(this).addClass("menu-active");
        $(".home-menu-options").addClass("menu-options-active");
    })

    $(".cell").on("keyup", function()
    {
        setHeight(this);
    })

    function setHeight(ab)
    {
        let height = $(ab).height();
        let rowId = $(ab).attr("r-id");
        let leftCol = $(".left-col-cell")[rowId];
        $(leftCol).height(height);
    }

    $("#cell-text").on("change", function()
    {
        let color = $(this).val();
        $(lsc).css("color", `${color}`);
        let cellObject = getCellObject(lsc);
        cellObject.textColor = color;
    })

    $("#cell-background").on("change", function()
    {
        let color = $(this).val();
        $(lsc).css("background", `${color}`);
        let cellObject = getCellObject(lsc);
        cellObject.background = color;
    })

    $(".bold").on("click", function()
    {
        let cellObject = getCellObject(lsc);
        $(lsc).css("font-weight", cellObject.cellFormatting.bold ? "normal" : "bold");
        cellObject.cellFormatting.bold = !cellObject.cellFormatting.bold;
    })

    $(".underline").on("click", function()
    {
        let cellObject = getCellObject(lsc);
        $(lsc).css("text-decoration", cellObject.cellFormatting.underline ? "none" : "underline");
        cellObject.cellFormatting.underline = !cellObject.cellFormatting.underline;
    })

    $(".italic").on("click", function()
    {
        let cellObject = getCellObject(lsc);
        $(lsc).css("font-style", cellObject.cellFormatting.italic ? "normal" : "italic");
        cellObject.cellFormatting.italic = !cellObject.cellFormatting.italic;
    })

    $("#cell-font").on("click", function(){
        let fontValue = $(this).val();
        $(lsc).css("font-family", `${fontValue}`);
        let cellObject = getCellObject(lsc);
        cellObject.fontFamily = fontValue;
        setHeight(lsc);
    })

    // left // center // right
    $(".cell-alignment div").on("click", function()
    {
        let alignment = $(this).attr("class");  
        $(lsc).css("text-align", `${alignment}`);
        let cellObject = getCellObject(lsc);
        cellObject.cellAlignment = alignment;
    })

    //font slider
    $("#font-slider").on("change", function()
    {
        let value = $(this).val();
        $(lsc).css("font-size", `${value}px`);
        let cellObject = getCellObject(lsc);
        cellObject.fontSize = `${value}px`;
        setHeight(lsc);
    })

    $(".cell").on("click", function()
    {
        //console.log("Cell clicked");
        
        let rowId = Number($(this).attr("r-id"));  
        let colId = Number($(this).attr("c-id"));
        
        let address = String.fromCharCode(65+colId) + (rowId+1);  
        $(".address").val(address);   
        let cellObject = getCellObject(this);
        $(".cell-formula").val(cellObject.formula);
    })

    $(".cell").on("blur", function()
    {
        $(this).removeClass("active");
        lsc = this;
        //to update the value user entered in the cell to the database in console
        let value = $(this).text();
        //console.log(value);

        let cellObject = getCellObject(this);
        if(value != cellObject.value)
        {
            cellObject.value = value;
            //console.log(db);
            if(cellObject.formula)   
            {
                removeFormula(cellObject);
                $(".cell-formula").val("");
                console.log(db);
            }
            updateChildrens(cellObject);
        }
    })

    function removeFormula(cellObject)
    {
        cellObject.formula = "";
        //remove self from childrens of parents
        for(let i = 0; i < cellObject.parents.length; i++)
        {
            let parentName= cellObject.parents[i];
            let {rowId, colId} = getRowIdColIdFromAddress(parentName);
            let parentCellObject = db[rowId][colId];
            let newChildrensOfParent = parentCellObject.childrens.filter( function (child)
            {
                return child != cellObject.name;
            })
            parentCellObject.childrens = newChildrensOfParent;
        }
        //clear parents
        cellObject.parents = [];
    }

    //formula
    $(".cell-formula").on("blur", function()
    {
        let formula = $(this).val();   
        //console.log(formula);
        if( !Number($(lsc).text()) == Nan )
        {
            alert("Value entered is a String !");
            return;
        }
        
        let cellObject = getCellObject(lsc);
        if(cellObject.formula != formula)
        {
            removeFormula(cellObject);
            if(formula == "")
            {
                $(lsc).text("");
                return;
            }
        } 
        addFormula(formula);        // add formula to self => calculate value => update db value => update UI
        updateChildrens(cellObject);  
    })

    //to keep upper row n left colum fixed while scrolling
    $(".content").on("scroll", function()
    {
        let topOffSet = $(this).scrollTop();  
        let leftOffSet = $(this).scrollLeft();  
        //console.log("top", topOffSet);
        //console.log("left", leftOffSet);
        $(".top-left-cell , .top-row").css("top", topOffSet + "px");  
        $(".top-left-cell , .left-col").css("left", leftOffSet + "px");  
    })

    function addFormula(formula)
    {
        let cellObject = getCellObject(lsc);
        cellObject.formula = formula;
        solveFormula(cellObject);
    }

    function solveFormula(cellObject)
    {
        let formula = cellObject.formula;
        console.log(formula);
        let fComps = formula.split(" ");
        for(let  i = 0; i < fComps.length; i++)
        {
            let fComp = fComps[i];
            let cellName = fComp[0];
            if(cellName >= "A" && cellName <= "Z")
            {
                console.log(fComp);
                let {rowId, colId} = getRowIdColIdFromAddress(fComp);
                let parentCellObject = db[rowId][colId];
                parentCellObject.childrens.push(cellObject.name);
                cellObject.parents.push(fComp);
                let value = Number(parentCellObject.value);
                formula = formula.replace(fComp, value);
            }
        }
        //console.log(formula);
        let value = eval(formula);
        cellObject.value = value;
        $(lsc).text(value); 
    }

    function updateChildrens(cellObject)
    {
        let childrens = cellObject.childrens;
        for(let  i =0 ; i < childrens.length; i++)
        {
            let childName = childrens[i];
            let {rowId, colId} = getRowIdColIdFromAddress(childName);
            let childObject = db[rowId][colId];
            reCalculate(childObject);  //fetch formula => formula evaluation => db update => UI update
            updateChildrens(childObject);  
        }
    }

    function reCalculate(cellObject)
    {
        let formula = cellObject.formula;
        let fComps = formula.split(" ");
        for(let i = 0 ; i < fComps.length; i++)
        {
            let fComp = fComps[i];
            let cellName = fComp[0];
            if(cellName >= 'A' && cellName <= 'Z')
            {
                let {rowId, colId} = getRowIdColIdFromAddress(fComp);
                let parentCellObject = db[rowId][colId];
                let value = Number(parentCellObject.value);
                formula = formula.replace(fComp, value);
            }
        }
        let value = eval(formula);
        cellObject.value = value;
        let {rowId, colId} = getRowIdColIdFromAddress(cellObject.name);
        $(`.cell[r-id=${rowId}][c-id=${colId}]`).text(value);
    }

    // database implementation in console
    function init()
    {
        $(".new").trigger("click");
    };
    init();   

    //utility function 
    function getAddressFromRowIdColId(i,j)
    {
        let row = i + 1;
        let col = String.fromCharCode(65 + j);
        let address = `${col}${row}`;
        return address;
    }

    function getRowIdColIdFromAddress(address)
    {
        let row = Number(address.substring(1)) - 1;
        let col = address.charCodeAt(0) - 65;
        return {
            rowId : row,
            colId : col
        };
    }

    function getCellObject(element)
    {
        let rowId = Number($(element).attr("r-id"));
        let colId = Number($(element).attr("c-id"));
        let cellObject = db[rowId][colId];
        return cellObject;
    }
})