import { customer } from './../../services/types/customerType';
import { CheckoutServiceService } from './../../services/checkout-service.service';
import { CheckoutItem } from './../../services/types/checkoutItem';
import { Items } from './../../services/types/items';
import { AddCustomerComponent } from './../../secondaryPages/add-customer/add-customer.component';
import { DatabaseService } from './../../services/database.service';
import { SecondaryService } from './../../services/secondary.service';
import { Component, OnInit, Inject, AfterViewInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { ListCustomerComponent } from 'src/app/secondaryPages/list-customer/list-customer.component';
import { AddDiscountComponent } from 'src/app/secondaryPages/add-discount/add-discount.component';
import { FormControl } from '@angular/forms';
import { AddCheckoutComponent } from 'src/app/secondaryPages/add-checkout/add-checkout.component';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { CheckOutItemComponent } from 'src/app/secondaryPages/check-out-item/check-out-item.component';
import { DisplayCheckoutComponent } from 'src/app/secondaryPages/display-checkout/display-checkout.component';
import { SearchItemComponent } from 'src/app/secondaryPages/search-item/search-item.component';
import { AuthServiceService } from 'src/app/auth/auth-service.service';
import { SupportComponent } from 'src/app/secondaryPages/support/support.component';
import { ShortcutDetails } from 'electron/main';
import { ShortcutEventOutput, ShortcutInput } from 'ng-keyboard-shortcuts';
@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss']
})
export class CheckoutComponent implements AfterViewInit {


  //Express mode Guest Customer  Dummy Data

  guestCustomer = { type: "customer", name: "Guest", email: "", phNumber: "" , notes: "", _id: "0000" }



  searchBar = new FormControl('')
  searchBarValue: string = ''



  selectedPaymentMode = ["Cash"]
cashCollected:number 


  itemCount
  itemInfo


  itemId
  taxInEx


  sesarchItem
  data = [];


  one: string[] = ['']
  selectedStates

  searchText = '';
  myControl = new FormControl();
  filteredOptions: Observable<string[]>;
  customerData: customer
  items: Array<CheckoutItem> = []

  dataSource: MatTableDataSource<CheckoutItem>
  updateResult
  indivisualTotal: number
  finalTotal: number
  finalDiscount: number = 0
  discountType: any = ''
  totalCost: number = 0
  typesOfPayment = [];
  allTaxes
  inex
  finalTax: number = 0
  subtotal: number = 0
  checkoutSettings
  // selevting the forst payment
  selectedOp

  bag = []

  userInfo
  shortcuts: ShortcutInput[] = [];

  // gets value for search bar and payment modes from settings
  constructor(  private auth: AuthServiceService, private matBottom: MatBottomSheet, private checkService: CheckoutServiceService, private dialog: MatDialog, private databaseService: DatabaseService, @Inject(SecondaryService) private secService: SecondaryService) {
    this.auth.isRegistered().then(x => {
      this.userInfo = x
    })



    

    this.checkoutSettings = this.checkService.checkoutSettings




    this.bag = this.checkService.getBag




    this.searchBar.valueChanges.subscribe(res => {
      this.searchBarValue = res
      this.searchBarcode(this.searchBarValue)
    })




    // this.databaseService.getAllItems().then(x => {
    //   this.data = x
    // })


    this.databaseService.getPay().then(x => {
      this.typesOfPayment = x
    })



    // this.getTaxes()
  }


  changePaymentCollected(data){
    

  }



expressCheckoutModeChange(term){

  this.checkService.checkoutSettings.expressMode = term

}

  /// this searches for the item when barcode is inserted
  searchBarcode(barcode) {

    console.log(barcode)
    this.databaseService.getItemBar(barcode).then(x => {
      let results: Array<any> = x

      if (results.length != 0) {
        if (results.length >= 1) {
          //double items
          if (results.length >= 2) {


            const dialogRef = this.dialog.open(AddCheckoutComponent, {
              maxWidth: '450px',
              width: '90%',
              panelClass: 'dialogCss',
              data: { data: results }
            })


            dialogRef.afterClosed().subscribe(result => {

              if (result) {
                this.addItem(result)
                console.log(result)
                this.searchBar.reset()
              } else {
                this.searchBar.reset()
                console.log("nothing")
              }


            })









          } else {
            this.addItem(results[0])
          }

        }
      }
    }

    ).catch(err => {



      console.log(err)
    })


    this.databaseService.getCountBar(barcode).then(x => {




    })
  }











  // gets information about the selected barcode and will trigger addcheckout component if more than one product returns 
  // or will proceed to inserting by calling insertData
  getInfo() {


    if (this.itemCount >= 2) {
      const dialogRef = this.dialog.open(AddCheckoutComponent, {
        height: '800px',
        width: '800px',
        data: { data: this.itemInfo }
      });

      dialogRef.afterClosed().subscribe(result => {
        console.log('The dialog was closed');
        this.itemId = result;

        this.databaseService.getItem(this.itemId).then(x => {

          this.itemInfo = x[0]
          // this.getInEx(this.itemInfo)
          //this.insertData(this.itemInfo)
        })
      });
    }
    else {
      // this.getInEx(this.itemInfo[0])
      //this.insertData(this.itemInfo[0])
    }




  }


  searchPopup() {
    let dialogRef = this.dialog.open(SearchItemComponent, {
      maxWidth: '450px',
      width: '90%',
      panelClass: 'dialogCss'
    })


    //getting Customer Data
    dialogRef.afterClosed().subscribe(result => {
      this.addItem(result.data)
    });

  }









  //drwaer toggle 

  drawerToggle() {
    this.secService.toggle()
  }











  /// on clicking it calls discount customer and calculates total again by calling finalDiacount function
  addDiscount() {

    this.discountType = ""
    this.finalDiscount = 0



    let dialogRef = this.dialog.open(AddDiscountComponent, {
      maxWidth: '450px',
      width: '90%',
      panelClass: 'dialogCss'

    })


    dialogRef.afterClosed().subscribe(result => {

      console.log(result)
      this.finalDiscount = result.discount
      this.discountType = result.grp
      // this.calculateTotal(this.dataSource.data)

    });
  }




  getdiscount() {
    if (this.discountType == 'percentage') {

      return ((this.getTotal() * this.finalDiscount) / 100)

    }
    else {
      return this.finalDiscount
    }
  }



  addNewCustomer() {
    let dialogRef = this.dialog.open(AddCustomerComponent, {
      maxWidth: '450px',
      width: '90%',
      panelClass: 'dialogCss'

    })


    //getting Customer Data
    dialogRef.afterClosed().subscribe(result => {
      this.customerData = result
      console.log(result)
    });


  }




  // get all customers 
  //below button
  addCustomer() {
    let dialogRef = this.dialog.open(ListCustomerComponent, {
      maxWidth: '450px',
      width: '90%',
      maxHeight:'90%',
     
      panelClass: 'dialogCss'

    })


    //getting Customer Data
    dialogRef.afterClosed().subscribe(result => {
      this.customerData = result
      console.log(result)
    });


  }

  getTotal() {
    return this.bag.reduce((i, j) => i + j.price * j.quantity, 0);
  }


  getTax() {

    return this.bag.reduce((i, j) => i + ((j.price * j.quantity) * j.tax / 100), 0);

  }






  getGrantTotal() {
    return this.getTotal() - this.getdiscount()
  }




//support Popup generation
  support(){
    const dialogRef = this.dialog.open(SupportComponent, {
      maxWidth: '450px',
      width: '90%',
      panelClass: 'dialogCss'
    })

    
  }









  // seaches for all item and retrieves them
  searchItem() {
    this.databaseService.getAllItems().then(x => {
      this.sesarchItem = x
    })
  }


  addItem(item) {
    this.checkService.addItem(item)

    this.dataSource = new MatTableDataSource<CheckoutItem>(this.bag)
    this.searchBar.reset()
  }


  displayedColumns: string[] = ['barcode', 'name', 'quantity', 'cost', 'tax', 'total'];
  i = 0;
















  changeModePayment(choice) {
    console.log(choice)
console.log(this.selectedPaymentMode)
  }


  //this is the bottom sheet for editing quantity and price and it returns the vale as well as recalulates the total by calling updateResults function
  options(data) {
    //this.checkService.editItem(data)
    //this.dataSource = new MatTableDataSource<CheckoutItem>(this.bag)
    console.log(data)
    const bottomSheetRef = this.matBottom.open(CheckOutItemComponent, {
      data: data
    })
    bottomSheetRef.afterDismissed().subscribe((result) => {
      console.log(result)
      this.updateResult = result
      this.dataSource = new MatTableDataSource<CheckoutItem>(this.bag)

      // this.updateResult.total = this.costCalculation(this.updateResult.price, this.updateResult.quantity, data.inEx, this.updateResult.tax)
      // console.log(this.updateResult)
      // this.calculateTotal(this.dataSource.data)
      console.log('Bottom sheet has been dismissed.');
    });
  }


  /// next four  are for the search bar at the top pf the checkout page 
  keyword = 'name';

  selectEvent(item) {
    // console.log(item)
    // this.getInEx(item)
    //this.insertData(item)
  }

  onChangeSearch(val: string) {
    console.log(val)
  }

  onFocused(e) {
    console.log(e)
  }


  reset() {


    this.checkService.clearBag()
  
    this.customerData = null
    this.finalDiscount = 0
    this.discountType = ''
    this.dataSource = new MatTableDataSource<CheckoutItem>(this.bag)
console.log(this.dataSource)
  }






  checkOut() {
    if (this.checkoutSettings.expressMode == true) {
      this.customerData = this.guestCustomer
    }

    if (this.customerData == undefined || this.bag.length == 0  || this.selectedPaymentMode.length == 0) {
      if (this.bag.length == 0) {
        this.secService.presentSanckBar(' 👨🏻‍✈️ No items Present in bill,Please add an items ', 'ok')

      }
      if (this.customerData == undefined) {
        this.secService.presentSanckBar('👨🏻‍✈️ Please Add Customer to proceed', 'ok')

      }
      if (this.selectedPaymentMode == undefined) {
        this.secService.presentSanckBar('👨🏻‍✈️ Select aleast one payment mode', 'ok')
      }
    }
    else {
      console.log(this.selectedPaymentMode)
      const dialogRef = this.dialog.open(DisplayCheckoutComponent, {
        maxWidth: '450px',
        width: '90%',
        panelClass: 'dialogCss',
        data: {
          data: this.dataSource.filteredData,
          total: this.getGrantTotal(),
          pay: this.selectedPaymentMode[0],
          discount: this.getdiscount(),
          subTotal: this.getTotal(),
          tax: this.getTax(),
          customer: this.customerData,
          popupOption:this.checkoutSettings.askForPrintOption,
          defaultPrintOption:this.checkoutSettings.defaultPrintOption
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        console.log(result)
        if (result == 'success') {
          this.reset()
        }

      });
    }
  }


  ngAfterViewInit() {
    this.shortcuts.push(
      {
        key: "c",
        label: "List of Customer",
        description: "Displays List of Customer to add to the checkout",
        command: (e) => this.addCustomer(),
        preventDefault: true
      },
      {
        key: "cmd + c",
        label: "Add New Customer",
        description: "Displays List of Customer to add to the checkout",
        command: (e) => this.addNewCustomer(),
        preventDefault: true
      },
      {
        key: "d",
        label: "Add Discount",
        description: "Displays List of Customer to add to the checkout",
        command: (e) => this.addDiscount(),
        preventDefault: true
      },
      {
        key: "s",
        label: "Add Discount",
        description: "Displays List of Customer to add to the checkout",
        command: (e) => this.searchPopup(),
        preventDefault: true
      },
      {
        key: "esc",
        label: "Toggle Menu",
        description: "Displays List of Customer to add to the checkout",
        command: (e) => this.drawerToggle(),
        preventDefault: true
      },
      {
        key: "enter",
        label: "Toggle Menu",
        description: "Displays List of Customer to add to the checkout",
        command: (e) => this.checkOut(),
        preventDefault: true
      }

    

    );
  }
}
