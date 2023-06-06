import { LightningElement, api } from 'lwc';
import updateUser from '@salesforce/apex/Users.updateUser';
import ACCOUNTMEMBER_OBJECT from '@salesforce/schema/AccountTeamMember';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import LightningConfirm from "lightning/confirm";

export default class UserMemberEdit extends LightningElement {
    @api recordId;
    @api getIsModelOpen;
    @api member = {};
    imageUrl
    imageName
    timeoutId
    accountTeamObjectApi = ACCOUNTMEMBER_OBJECT;
    newFileWasUploaded = false;
    uploadedFiles;

    get acceptedFormats() {
        return ['.jpg', '.png', 'jpeg'];
    }
    handleUploadFinished(event) {

        this.uploadedFiles = event.detail.files[0];
        this.showNotification('Success', 'Image Uploded  Successfully!!', 'Success')
        this.imageUrl = this.template.querySelector('img').src = '/sfc/servlet.shepherd/version/download/' + this.uploadedFiles.contentVersionId;
        this.imageName = this.uploadedFiles.name;
    }

    closeModelHandller() {
        if (this.getIsModelOpen) {
            this.getIsModelOpen = false;
            this.dispatchEvent(new CustomEvent('close'))
        }
    }
    showNotification(variant, message, title) {
        const evt = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant,
        });
        this.dispatchEvent(evt);
    }

    handleUpdate() {
        this.template.querySelector('lightning-record-edit-form').submit();
        if (this.imageUrl !== undefined) {
            updateUser({ userId: this.member.User.Id, documentId: this.uploadedFiles.documentId })
                .then((results) => {
                })
        }
        this.timeoutId = setTimeout(() => {
            this.closeModelHandller();
            this.showNotification('Success', 'Record is Edited Successfully!!', 'Success')
        }, 500);

    }

    async handleConfirmUpdate() {
        const result = await LightningConfirm.open({
            message: "Are you sure you want to Update this Account Team Member?",
            variant: "default",
            label: "Update Record"
        });

        if (result) {
            this.handleUpdate()
        } else {
        }
    }
}