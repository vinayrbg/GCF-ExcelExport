exports.helloGET = (req, res) => 
{
    console.log("hits =>",req.param('from_date'));  //(yyyy/mm/dd)
    //*********************************Date input******************************************************
    var dateStringFrom = req.param('from_date');
    //var dateStringFrom='2018/'+from_month+'/'+date_d;;
    var dFrom = new Date(dateStringFrom);
    var from_date = dFrom.getDate();
    var from_month = dFrom.getMonth()+1;
    var from_year = dFrom.getFullYear();
    console.log("Date input -> ", from_date, from_month, from_year);
    var dTo = new Date();
    var to_date = dTo.getDate();
    var to_month = dTo.getMonth()+1;
    console.log(dTo,dFrom);

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", 
    "September", "October", "November", "December"];

    function daysInMonth (month, year = 2018) {
        return new Date(year, month, 0).getDate();
    }

    //*********************************Firebase configuration*****************************************
    const admin = require('firebase-admin');
    admin.initializeApp({
        credential: admin.credential.applicationDefault()
    });
    var db = admin.firestore();

    //*********************************Excel configuration********************************************
    var xl = require('excel4node');
    var wb = new xl.Workbook();
    var header = wb.createStyle({
    font: {
        size: 13,
        bold: true,
        color: '020A12',
        name: 'Times New Roman'
        },
        alignment: {
            vertical: 'center', 
            horizontal: 'center',
            justifyLastLine: true
        },    
        border: 
        { 
            top: {
                style:'thick',
                color:'black'
            },
            bottom: {
                style:'thick',
                color:'black'
            },
            left: {
                style:'thick',
                color:'black'
            },
            right: {
                style:'thick',
                color:'black'
            }
        }    
    });

    var ws = [];

    var myStyle = wb.createStyle({
        font: {
            size: 12,
            bold: true,
            color: 'black',
            name: 'Times New Roman'
            },
        alignment: {
                vertical: 'center',
                horizontal: 'center',
                wrapText : true,
                justifyLastLine: true
            },
        border: 
            { 
                top: {
                    style:'thick',
                    color:'black'
                },
                bottom: {
                    style:'thick',
                    color:'black'
                },
                left: {
                    style:'thick',
                    color:'black'
                },
                right: {
                    style:'thick',
                    color:'black'
                }
            }    
        });  

        var sheetOptions = {
            'sheetFormat':{
              "defaultColWidth": 20
            }
          }
    var cellStyle = wb.createStyle({  // cell defualt style properties
        font: {
                size: 12,
                name: 'Times New Roman'
                },
        alignment: {
                vertical: 'center',
                horizontal: 'center',
                wrapText : true
                },
        border: { 
                    bottom: {
                        style:'thick',
                        color:'green'
                    }
                }    
            }
        )
    var belowStyle = wb.createStyle({
        font: {
            size: 12,
            bold: true,
            name: 'Times New Roman'
            },
        alignment: {
                vertical: 'center',
                horizontal: 'center',
                wrapText : true
            },    
        border: 
        { 
            bottom: {
                style:'thick',
                color:'FFF333'
            }
        }     
    });
    var emptyStyle = wb.createStyle({  // empty cell style properties    
        border: 
        { 
            bottom: {
                style:'thick',
                color:'EB250A'
            }
        }     
    });

    //*********************************Data structure**************************************************
    function Employee_List(name,fName){
        this.emp_name = name; 
        this.emp_fName = fName;
        this.dlist = [];
        this.addEntry = function(date,text,bgcolor,fgcolor){
            this.dlist.push(new Date_List(date,text,bgcolor,fgcolor));
        }
    }
    
    function Date_List(date,text ='07:36',bgcolor = -1,fgcolor = -1){
        this.date = date;
        this.text = text;
        this.bgcolor = bgcolor;
        this.fgcolor = fgcolor;
    }
    var emp = [];
    //***********************************Contains function********************************************
    function fun_contains(name) {
        for(var i = 0; i < emp.length; i++) {
            //console.log(emp[i].emp_name +" == "+ name)
            if (emp[i].emp_name == name) {
                return i;
            }       
        }
        return -1;
    }

    var query = db.collection('emp_records').where('date', '>=', dFrom).where('date', '<=', dTo);
    
    query.get()
        .then((snapshot) => {
            snapshot.forEach((doc) => {
        
                dd = ((doc.data().signOutTime - doc.data().signInTime) - (doc.data().lunchInTime - doc.data().lunchOutTime))/3600000;
 
            //*********************************time format******************************************
                e = Math.floor(dd);
                f = Math.floor(((dd % 1).toFixed(2))*60);
                if(f<10) f = "0"+f;
                finTime = e+"h:"+f+"m";
                var bc = 0;
                if(e<8) {
                    bc = 1; // background color yellow -> 1
                }
            //**************************************************************************************

                console.log(doc.id, '=>', doc.data().date, doc.data().empID);
                console.log("Month - > ", doc.data().date.getMonth()+1);
                var index = fun_contains(doc.data().empID);
                if( index != -1 ){
                    emp[index].addEntry(doc.data().date,finTime,bc);
                }
                else{
                    emp.push(new Employee_List(doc.data().empID,doc.data().fullName));
                    emp[emp.length - 1].addEntry(doc.data().date,finTime,bc);
                }
            }) 
        })
        .then(() => {
            for(var d=from_month;d<=to_month;d++)
            {
                //console.log("d => ", d);
                ws[d] = wb.addWorksheet(monthNames[d-1]+" "+from_year,sheetOptions);
                ws[d].cell(1,1).string('Hubble ID').style(header);
                ws[d].cell(1,2).string('Employee Name').style(header);
                emp.sort(function(a,b) {return (a.emp_fName > b.emp_fName) ? 1 : ((b.emp_fName > a.emp_fName) ? -1 : 0);} );
                for(var k=1; k<=daysInMonth(d);k++){
                    //if(k >= from_date && d == from_month || k <= to_date && d == to_month || d> from_month && d< to_month)
                        ws[d].cell(1,k+2).string(monthNames[d-1].substring(0, 3)+"' "+k).style(header);
                    
                }

                for(var i = 0; i < emp.length; i++) {
                    emp[i].dlist.sort(function(a,b) {return (a.date > b.date) ? 1 : ((b.date > a.date) ? -1 : 0);} );
                    ws[d].cell(i+2,1).string(emp[i].emp_name).style(myStyle);
                    ws[d].cell(i+2,2).string(emp[i].emp_fName).style(myStyle);
                    for(var t=1; t<=daysInMonth(d);t++){
                        if(t >= from_date && d == from_month || t <= to_date && d == to_month || d> from_month && d< to_month)
                            ws[d].cell(i+2,t+2).style(emptyStyle);
                    }
                    for(var j=0; j < emp[i].dlist.length;j++)
                    {
                        //console.log("Inside cell operation j:",j," d:",d);
                        if((emp[i].dlist[j].date.getMonth()+1) == d){
                            if(emp[i].dlist[j].bgcolor == 1){
                                ws[d].cell(i+2,emp[i].dlist[j].date.getDate()+2).string(emp[i].dlist[j].text).style(belowStyle);
                            }
                            else{
                                ws[d].cell(i+2,emp[i].dlist[j].date.getDate()+2).string(emp[i].dlist[j].text).style(cellStyle);
                            }
                        }
                        else if((emp[i].dlist[j].date.getMonth()+1) > d){
                            break;
                        }
                    }
                }
            }
            wb.write('/tmp/Timesheet.xlsx', function(err, stats) 
            {
                if (err) {
                    console.error(err);
                    res.status(500).send("Error Writing the Excel File");
                }  
                else {
                    console.log("Employee List.. ");
                    for(var i = 0; i < emp.length; i++) {
                        console.log(emp[i]);
                    }
                    res.status(200).download('/tmp/Timesheet.xlsx');
                }
            });
        })
        .catch((err) => {
            console.log('Error getting documents', err);
        });
}; 