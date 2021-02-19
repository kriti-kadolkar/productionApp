import { CheckoutServiceService } from './../../services/checkout-service.service';
import { SecondaryService } from './../../services/secondary.service';
import { DatabaseService } from 'src/app/services/database.service';
import { FormControl } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { AddCustomerComponent } from '../add-customer/add-customer.component';
import { runInThisContext } from 'vm';
import {MatFormFieldModule} from '@angular/material/form-field';
@Component({
  selector: 'app-list-customer',
  templateUrl: './list-customer.component.html',
  styleUrls: ['./list-customer.component.scss']
})
export class ListCustomerComponent implements OnInit {
  data = [];
  searchTerm = new FormControl('')
  searchTermValue:string =''
  searchResults=[]
  constructor(private checkoutSerice: CheckoutServiceService , private dialog: MatDialog,private db:DatabaseService,private secService: SecondaryService,public dialogRef: MatDialogRef<ListCustomerComponent>) {
    this.db.getCustomer().then(x=>{
      this.data = x
    })
}


searchCustomer(term){

  this.db.searchCustomer(term).then(res=>{
    this.searchResults= res
    console.log(res)
  }).catch(err=>{
this.secService.presentSanckBar(err,'danger')
  })

}



  ngOnInit(): void {
  }

  newCustomerModal(){
    this.dialog.open(AddCustomerComponent,{
      maxWidth:'450px'
      
      
    })
  }
 selectCustomer(item){
  console.log(item)
  this.dialogRef.close(item)
 }

  closeDialog(){


    this.dialog.closeAll()

  }
  keyword = 'name';
  selectEvent(item) {
    this.selectCustomer(item)
  }

  onChangeSearch(val: string) {
    // fetch remote data from here
    // And reassign the 'data' which is binded to 'data' property.
  }
  
  onFocused(e){
    // do something when input is focused
  }
}
