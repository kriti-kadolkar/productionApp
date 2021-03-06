import { Component, OnInit, Inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { SecondaryService } from 'src/app/services/secondary.service';
import {MatDatepickerModule} from '@angular/material/datepicker';
import { DatabaseService } from 'src/app/services/database.service';


@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent implements OnInit {
allItems
allTransactions
allCustomer
disableSelect = false
things: any[]
  constructor(@Inject(SecondaryService) private secService:SecondaryService,private db:DatabaseService) {
       this.db.getAllItems().then(x=>{
         console.log(x)
         this.allItems=x
       })
       this.db.getTransaction().then(x=>{
         console.log(x)
         this.allTransactions = x
       })
       this.db.getCustomer().then(x=>{
         console.log(x)
         this.allCustomer =x
       })
       this.things = [];
   }

  ngOnInit(): void {
  }
  reportForm = new FormGroup({
    type: new FormControl('',Validators.required),
    startdate: new FormControl('not for sales',Validators.required),
    enddate: new FormControl('not for sales',Validators.required),
  });
  maxDate = new Date();
  drawerToggle(){
    this.secService.toggle()
  }
  submit(){
    
      if(this.reportForm.value.type == 'sales'){
        console.log(this.reportForm)
        this.db.getBetweenDates(this.reportForm.value.startdate,this.reportForm.value.enddate).then(x=>{
          console.log(x)
          this.convertToCsv1(x)
        })
      }
      else if(this.reportForm.value.type == 'item'){
        console.log(this.reportForm)
        this.convertToCsv(this.allItems)
      }
      else{
        console.log(this.reportForm)
        this.convertToCsv(this.allCustomer)
      }
  }

  doSomething($event){
    if($event.value == 'sales'){
     this.disableSelect = false
    }
    else{
      this.disableSelect = true
    }
  }
convertToCsv(data){
  const items = data
const replacer = (key, value) => value === null ? '' : value // specify how you want to handle null values here
const header = Object.keys(items[0])
const csv = [
  header.join(','), // header row first
  ...items.map(row => header.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(','))
].join('\r\n')

console.log(csv)

var downloadLink = document.createElement("a");
        var blob = new Blob(["\ufeff", csv]);
        var url = URL.createObjectURL(blob);
        downloadLink.href = url;
        downloadLink.download = "report.csv";  //Name the file here
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
}
itemHeader : any[] = [];
convertToCsv1(data){
  console.log(data)
  for (var index in data) {
        let Temp: Array<any>
        Temp = [
         data[index].customer.name, data[index].paymentType, data[index].total, data[index].typeOfTransaction]
        this.things.push(Temp)
      }
      
      const items = this.things
      const replacer = (key, value) => value === null ? '' : value // specify how you want to handle null values here
      const header = Object.keys(items[0])
      const csv = [
        header.join(','), // header row first
        ...items.map(row => header.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(','))
      ].join('\r\n')
      
      console.log(csv)
      
      var downloadLink = document.createElement("a");
              var blob = new Blob(["\ufeff", csv]);
              var url = URL.createObjectURL(blob);
              downloadLink.href = url;
              downloadLink.download = "report.csv";  //Name the file here
              document.body.appendChild(downloadLink);
              downloadLink.click();
              document.body.removeChild(downloadLink);
}
  




}

