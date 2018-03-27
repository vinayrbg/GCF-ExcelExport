exports.helloGET = (req, res) => 
{
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
        color: '020A12'
        },
        alignment: {
            vertical: 'center', 
            horizontal: 'center'
        }
    });

    var ws = [];

    var myStyle = wb.createStyle({
        font: {
            size: 12,
            bold: true,
            color: '062C51'
            },
        alignment: {
                vertical: 'center',
                horizontal: 'center',
                wrapText : true,
                justifyLastLine: true
            }
        });  

        var sheetOptions = {
            'sheetFormat':{
              "defaultColWidth": 40,
              "defaultRowHeight": 22
            }
          }

    //*********************************Date input******************************************************
    var date_d = 1;
    var from_month = 2;
    var dateStringFrom='2018/'+from_month+'/'+date_d;;
    var dFrom = new Date(dateStringFrom);
    var dTo = new Date();
    var to_month = dTo.getMonth()+1;
    console.log(dTo,dFrom);

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", 
    "September", "October", "November", "December"];

    function daysInMonth (month, year = 2018) {
        return new Date(year, month, 0).getDate();
    }

    //*********************************Data structure**************************************************
    function Employee_List(name,fName){
        this.emp_name = name; 
        this.emp_fName = fName;
        this.dlist = [];
        this.addEntry = function(date,text,bgcolor,fgcolor){
            this.dlist.push(new Date_List(date,text,bgcolor,fgcolor));
        }
    }
    
    function Date_List(date,text ='07:36',bgcolor = 'red',fgcolor = 'blue'){
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
                finTime = e+":"+f;
            //**************************************************************************************

                console.log(doc.id, '=>', doc.data().date, doc.data().empID);
                console.log("Month - > ", doc.data().date.getMonth()+1);
                var index = fun_contains(doc.data().empID);
                if( index != -1 ){
                    emp[index].addEntry(doc.data().date,finTime);
                }
                else{
                    emp.push(new Employee_List(doc.data().empID,doc.data().fullName));
                    emp[emp.length - 1].addEntry(doc.data().date,finTime);
                }
            }) 
        })
        .then(() => {
            for(var d=from_month;d<=to_month;d++)
            {
                console.log("d => ", d);
                ws[d] = wb.addWorksheet(monthNames[d-1],sheetOptions);
                ws[d].cell(1,1).string('EmployeeID').style(header);
                ws[d].cell(1,2).string('Name').style(header);
                emp.sort(function(a,b) {return (a.emp_fName > b.emp_fName) ? 1 : ((b.emp_fName > a.emp_fName) ? -1 : 0);} );
                for(var k=1; k<=daysInMonth(d);k++){
                    ws[d].cell(1,k+2).string(monthNames[d-1]+"' "+k).style(header);
                }

                for(var i = 0; i < emp.length; i++) {
                    emp[i].dlist.sort(function(a,b) {return (a.date > b.date) ? 1 : ((b.date > a.date) ? -1 : 0);} );
                    ws[d].cell(i+2,1).string(emp[i].emp_name).style(myStyle);
                    ws[d].cell(i+2,2).string(emp[i].emp_fName).style(myStyle);
                    for(var j=0; j < emp[i].dlist.length;j++)
                    {
                        console.log(emp[i].dlist[j].date.getMonth()+1 +"=="+ d);
                        if((emp[i].dlist[j].date.getMonth()+1) == d){
                            ws[d].cell(i+2,emp[i].dlist[j].date.getDate()+2).string(emp[i].dlist[j].text);
                        }
                        else if((emp[i].dlist[j].date.getMonth()+1) > d){
                            break;
                        }
                    }
                }
            }
            wb.write('/tmp/sampe.xlsx', function(err, stats) 
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
                    res.status(200).download('/tmp/sampe.xlsx');
                }
            });
        })
        .catch((err) => {
            console.log('Error getting documents', err);
        });
};

/*
        wb.writeToBuffer().then((buffer) => {

            // send mail here using nodemailer

            return 1;
        }).catch(function(error) {
            console.log(error);

        }); 
       */
        
                    /*if(i == 0){
                        ws.cell(i+1,j+2).date(emp[i].dlist[j].date).style; 
                        console.log("Inside - > ", emp[i].dlist[j].date)
                    }*/
    //res.download('/tmp/sampe.xlsx');

//console.log("Lunch time -> ",(doc.data().lunchInTime - doc.data().lunchOutTime));
                //console.log("Overall time -> ",(doc.data().signOutTime - doc.data().signInTime));
// Intead of foreach
/*var arrayDocs = snapshot.docs.map(docData => docData.data())
            console.log(arrayDocs);
            //res.send(arrayDocs);
            //var len = snapshot.docs.length;
            //console.log(len);*/

 //***********************************Sort function************************************************

    /*objs.sort(function(a,b) {return (a.last_nom > b.last_nom) ? 1 : ((b.last_nom > a.last_nom) ? -1 : 0);} );
    function compare(a,b) {
        if (a.last_nom < b.last_nom)
          return -1;
        if (a.last_nom > b.last_nom)
          return 1;
        return 0;
      }*/
    //************************************************************************************************
            
/*writeStream.write(header);
    var writeStream = fs.createWriteStream("/tmp/sampe.xls");
            var header="Date"+"\n";
//writeStream.write(doc.data().empID);
            writeStream.close();
*/

// ws.cell(1,2).string(doc.id);
       // ws.cell(1,3).number(100).style(style);      
       // ws.cell(1,1).number(120).style(style);
       // ws.cell(2,1).number(123).style(style);
       // wb.write('/tmp/sampe.xlsx'); 