import { LightningElement, wire, track, api } from 'lwc';
import getRecords from '@salesforce/apex/Users.getRecords';
import getDefaultTeam from '@salesforce/apex/AccountTeamMembersController.getDefaultTeam';
import deleteMemberRecord from '@salesforce/apex/AccountTeamMembersController.deleteMemberRecord';
import fontsforSocialMedia from '@salesforce/resourceUrl/FontAwesome';
import { loadStyle } from 'lightning/platformResourceLoader';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';
import LightningConfirm from "lightning/confirm";
export default class AccountTeamMemberComponent extends LightningElement {

  data = [];
  checkedBoxesIds = [];
  defaultData
  selectedObj2 = [];
  selectedIds = [];
  error;
  userRecordId;
  userIdDetq;
  @api recordId;
  @track valueError;
  wiredActivities;
  @api isModelOpen = false;
  @api isEditModelOpen = false;
  @api isDeleteSecelect = false;
  @api deleteMultipleLabel = 'Select Memebers To Delete'
  @api buttonVariant = 'brand';

  @wire(getRecords, ({ recordId: '$recordId' }))
  wiredclass(value) {
    this.wiredActivities = value;

    const { data, error } = value;
    if (data) {
      let lstdata = JSON.parse(JSON.stringify(data));
      this.data = lstdata;
      this.error = undefined;
    } else if (error) {
      this.error = error;
      this.data = undefined;
    }
  }

  clickEdit(event) {
    this.memberId = event.currentTarget.dataset.memberid;
    this.selectedObj2 = this.data.find((elem) => {
      return elem.Id === this.memberId;
    });
    if (this.selectedObj2 != null || this.selectedObj2 != '') {
      this.isEditModelOpen = true;
    }

    this.isEditModelOpen = true;
  }

  renderedCallback() {
    Promise.all([
      loadStyle(this, fontsforSocialMedia + '/fontawesome-free-6.4.0-web/css/all.css')
    ]).catch(error => {
      console.log(error);
    });
  }

  handleContactDelete(event) {
    if (event.currentTarget.dataset.id) {
      this.handleConfirmClick(event.currentTarget.dataset.id)
    }

  }

  async handleConfirmClick(userRecordIds) {
    const result = await LightningConfirm.open({
      message: "Are you sure you want to delete  Account Team Member(s)?",
      variant: "default",
      label: "Delete a record(s)"
    });
    if (result) {
      deleteMemberRecord({ selectedRecordsId: userRecordIds })
        .then(() => {
          this.showToastMessage('Delete!!', 'Record(s) deleted successfully', 'success')
          return refreshApex(this.wiredActivities);
        })
        .catch(error => {
          window.console.log('Unable to delete record due to ' + error.body.message);
        });
    } else {
    }
  }

  handleDefaultTeam() {
    getDefaultTeam({ accRecordId: this.recordId })
      .then((results) => {
        const res = this.data.filter(exiList => results.some(newLiatItem => newLiatItem.Id === exiList.Id));
        if (res.length !== results.length) {
          this.showToastMessage('Success!!', 'Default member Record(s) added successfully', 'success')
        }
        else {
          this.showToastMessage('Unable to process!!', 'Default member Record(s)  alredy added to This Account', 'warning')

        }
        return refreshApex(this.wiredActivities);
      })
  }

  handleCreateMember() {
    this.isModelOpen = true;
  }

  modalCloseHandler() {
    this.isModelOpen = false;
    this.isEditModelOpen = false;
    return refreshApex(this.wiredActivities);
  }

  handleCheckBoxChange() {
    this.checkedBoxesIds = [...this.template.querySelectorAll('lightning-input')]
      .filter(element => element.checked)
      .map(element => element.dataset.id);
  }

  handleDeleteMutlipleTeam(event) {
    if (event.target.label == 'Select Memebers To Delete') {
      this.deleteMultipleLabel = 'Delete Selected Records'
      this.buttonVariant = 'destructive';
      this.isDeleteSecelect = true;
    }
    if (event.target.label == 'Delete Selected Records') {

      if (this.checkedBoxesIds.length > 0) {
        this.handleConfirmClick(this.checkedBoxesIds)
        this.deleteMultipleLabel = 'Select Memebers To Delete'
        this.buttonVariant = 'brand'
        this.isDeleteSecelect = false;
      }
      else {
        this.showToastMessage('Nothing is selected!!', 'Try again with selcet atleast one team member to delete!!', 'warning')
      }
      this.deleteMultipleLabel = 'Select Memebers To Delete'
      this.buttonVariant = 'brand'
      this.isDeleteSecelect = false;
    }
  }

  showToastMessage(title, message, variant) {
    this.dispatchEvent(
      new ShowToastEvent({
        title: title,
        message: message,
        variant: variant
      })
    );
  }
}