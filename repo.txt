exports.helloGET = (req, res) => 
{
    //Firebase configuration
    const admin = require('firebase-admin');
    admin.initializeApp({
        credential: admin.credential.applicationDefault()
    });
    var db = admin.firestore();

    //Excel configuration
    var xl = require('excel4node');
    var wb = new xl.Workbook();
    var ws = wb.addWorksheet('Sheet 1');
    var style = wb.createStyle({
    font: {
        color: '#FF0800',
        size: 12
        }
    });
    ws.cell(1,1).string('EmployeeID').style;     //ws.cell(1,2).string('Location').style;  //ws.cell(1,3).string('Time Clocked').style;

    //Date input
    var date_d = 12;
    var dateStringTo='2018/03/'+date_d;
    var dt = new Date(dateStringTo);
    var dateStringFrom='2018/03/01';
    var df = new Date(dateStringFrom);
    console.log(dt,df);

    var emp_list = ["vbasavaraje", "avavilala"];

    //.where('empID','==','vbasavaraje')
    //var emp = db.collection('emp_records').
    //var i = 1;
    //var empquery = query;//.where('date', '>=', df).where('date', '<=', dt)
    for(x in emp_list){
        var i = 1;
        console.log("i outside=> ",i);
        var query = db.collection('emp_records').where('empID','==','emp_list[x]');
        query.get()
        .then((snapshot) => {
            snapshot.forEach((doc) => {
                var date_val = doc.data().date.getDate();
                if(i == 1){
                    ws.cell(i,date_val+1).date(doc.data().date).style;
                    console.log("i nside ==> ",i);
                }
                console.log(doc.id, '=>', doc.data().date, doc.data().empID);
                console.log("Month - > ", date_val);
                console.log("i ==> ",i);
                
                dd = ((doc.data().signOutTime - doc.data().signInTime) - (doc.data().lunchInTime - doc.data().lunchOutTime))/3600000;
                //console.log("Working time", d ," i ->", i); 
                
                //time format
                e = Math.floor(dd);
                f = Math.floor(((dd % 1).toFixed(2))*60);
                if(f<10) f = "0"+f;
                finTime = e+":"+f;

                ws.cell(2,date_val+1).string(finTime);

                wb.write('/tmp/sampe.xlsx', function(err, stats) {
                if (err) {
                  console.error(err);
                  res.status(500).send("Error Writing the Excel File");
                    }  
                else {
                        console.log(stats);
                        res.status(200).download('/tmp/sampe.xlsx');
                    }
                });
            }) 
        })
        .catch((err) => {
            console.log('Error getting documents', err);
        });
        i++;
    }
    
};

/*
        wb.writeToBuffer().then((buffer) => {

            // send mail here using nodemailer

            return 1;
        }).catch(function(error) {
            console.log(error);

        }); 
       */
        
    //res.download('/tmp/sampe.xlsx');

//console.log("Lunch time -> ",(doc.data().lunchInTime - doc.data().lunchOutTime));
                //console.log("Overall time -> ",(doc.data().signOutTime - doc.data().signInTime));
// Intead of foreach
/*var arrayDocs = snapshot.docs.map(docData => docData.data())
            console.log(arrayDocs);
            //res.send(arrayDocs);
            //var len = snapshot.docs.length;
            //console.log(len);*/
           
/*
 
 writeStream.write(header);
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