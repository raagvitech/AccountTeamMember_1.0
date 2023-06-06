import { LightningElement, wire, api } from 'lwc';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import ACCOUNTMEMBER_OBJECT from '@salesforce/schema/AccountTeamMember';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import saveMember from '@salesforce/apex/AccountTeamMembersController.createMemeber';
import getAllUsers from '@salesforce/apex/AccountTeamMembersController.getAllUsers';
import getRolePick from '@salesforce/apex/AccountTeamMembersController.getProduct';

export default class AddAccountTeam extends LightningElement {
    userOptions = [{ value: '-None-', label: '--None--' }];
    allAccess = [{ value: 'Edit', label: 'Read/Write' }];
    teamRoleOptions;
    roleOptionsData
    contacts = [];
    filterList = [];
    keyIndex = 0;
    isSpinner = false;
    UserDataId = [];
    userDataInfo;
    @api recordId;
    @api accRecordId;
    userInfoDataList;
    @api getIsModelOpen;

    @wire(getObjectInfo, { objectApiName: ACCOUNTMEMBER_OBJECT })
    accountMemberinfo;


    @wire(getAllUsers)
    wiredAccountMembers({ error, data }) {
        if (data) {
            let UseroptionsData = [];
            this.UserData = data;
            for (var key in data) {
                console.log('inside handle change for loop');
                UseroptionsData.push({ label: data[key].Name, value: data[key].Id });
            }
            this.userOptions = UseroptionsData;
        } else if (error) {
            console.log(error);
            this.error = error;
        }
    }
    @wire(getRolePick)
    wiredRolePicklist({ error, data }) {
        if (data) {
            let roleOptions = [];
            this.roleOptionsData = data;
            for (var key in data) {
                roleOptions.push({ label: data[key], value: data[key] });
            }
            this.teamRoleOptions = roleOptions;

        } else if (error) {
            console.log(error);
            this.error = error;
        }
    }

    connectedCallback() {
        this.handleAddRow();
    }

    handleChange(event) {
        if (event.target.name === 'userName') {
            this.filterList[event.currentTarget.dataset.index].UserId = event.target.value;
        }
        else if (event.target.name === 'teamRole') {
            this.filterList[event.currentTarget.dataset.index].TeamMemberRole = event.target.value;
        }
        else if (event.target.name === 'accountAccess') {
            this.filterList[event.currentTarget.dataset.index].AccountAccessLevel = event.target.value;
        }
        else if (event.target.name === 'caseAccess') {
            this.filterList[event.currentTarget.dataset.index].CaseAccessLevel = event.target.value;
        }
        else if (event.target.name === 'oppAccess') {
            this.filterList[event.currentTarget.dataset.index].OpportunityAccessLevel = event.target.value;
        }

    }

    handleAddRow() {
        let objRow = {
            Name: '',
            TeamMemberRole: '',
            AccountAccessLevel: '',
            CaseAccessLevel: '',
            OpportunityAccessLevel: '',
            id: ++this.keyIndex
        }

        this.filterList = [...this.filterList, Object.create(objRow)];
    }

    handleRemoveRow(event) {
        this.filterList = this.filterList.filter((ele) => {
            return parseInt(ele.id) !== parseInt(event.currentTarget.dataset.index);
        });

        if (this.filterList.length === 0) {
            this.handleAddRow();
        }
    }

    saveRows() {
        var allDataInfo = {
            accId: this.accRecordId,
            teamData: this.filterList

        }
        saveMember({ wrapper: allDataInfo })
            .then(result => {
                this.filterList = [];
                this.closeModelHandller();
                this.showToastMessage('Success', 'Record saved Successfully', 'Success');
            }).catch(error => {
                console.log(error);
                this.error = error;
            });
    }


    showToastMessage(variant, message, title) {
        this.dispatchEvent(
            new ShowToastEvent({
                title: title,
                message: message,
                variant: variant
            })
        );
    }

    closeModelHandller() {
        if (this.getIsModelOpen) {
            this.getIsModelOpen = false;
            this.dispatchEvent(new CustomEvent('close'))
        }

    }
}