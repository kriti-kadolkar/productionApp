import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatBottomSheet, MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { MatDialog } from '@angular/material/dialog';
import { CheckoutServiceService } from 'src/app/services/checkout-service.service';
import { DatabaseService } from 'src/app/services/database.service';
import { SecondaryService } from 'src/app/services/secondary.service';

@Component({
  selector: 'app-check-out-item',
  templateUrl: './check-out-item.component.html',
  styleUrls: ['./check-out-item.component.scss']
})
export class CheckOutItemComponent implements OnInit {
  checkOutForm = new FormGroup({
    price: new FormControl('',Validators.required),
    quantity: new FormControl('',Validators.required),
    // tax:new FormControl('')
  })
  tablePrice 
  tableQty

  constructor(private sec:SecondaryService ,private dialog:MatDialog,private bottom:MatBottomSheet,@Inject(MAT_BOTTOM_SHEET_DATA) public data: any,private checkoutService : CheckoutServiceService,private db: DatabaseService) { 
    this.tablePrice = data.price
    this.tableQty = data.quantity
  }

  ngOnInit(): void {
  }

  // function to close dialog
  onclose(){
    this.bottom.dismiss()
  }
  // finction to validate and update the item
  update(){
    if(this.checkOutForm.valid){
      console.log(this.checkOutForm.value.price,this.checkOutForm.value.quantity)
      this.data.price = this.checkOutForm.value.price
      this.data.quantity = this.checkOutForm.value.quantity
      // this.data.tax = this.checkOutForm.value.tax

      this.bottom.dismiss(this.updateData)

    }
    else{
      this.sec.presentSanckBar('Please Fill a Valid input','danger')
    }
  }
updateData
  removeItem(){
    this.updateData=this.checkoutService.removeItem(this.data)
    this.bottom.dismiss(this.updateData)
  }


  printData(){
    console.log(this.data)
    const printData = [{
      type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
      value: this.data.name,
      style: `text-align:left`,
      css: {"text-decoration": "bold", "font-size": "12px"}
   },{
      type: 'barCode',
      value: this.data.barcode,
      height: 12,                     // height of barcode, applicable only to bar and QR codes
      width: 1,                       // width of barcode, applicable only to bar and QR codes
      displayValue: true,             // Display value below barcode
      fontsize: 8,
   }]

  this.db.printLabel(printData)
  }
}
