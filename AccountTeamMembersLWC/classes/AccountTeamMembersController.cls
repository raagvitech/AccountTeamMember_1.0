public class AccountTeamMembersController {
  public class WrapperAccount {
    @auraenabled
    public string accId { get; set; }
    @AuraEnabled
    public List<AccountTeamMember> teamData { get; set; }
  }
  @AuraEnabled(cacheable=true)
  public static List<AccountTeamMember> getRecords(String recordId) {
    return [
      SELECT
        Id,
        AccountId,
        User.AboutMe,
        User.Name,
        User.FullPhotoUrl,
        TeamMemberRole,
        AccountAccessLevel
      FROM AccountTeamMember
      WHERE AccountId = :recordId
    ];
  }
  @AuraEnabled
  public static void createMemeber(WrapperAccount wrapper) {
    try {
      if (wrapper != null) {
        List<AccountTeamMember> team = new List<AccountTeamMember>();

        if (wrapper.teamData != null & wrapper.accId != null) {
          for (AccountTeamMember ct : wrapper.teamData) {
            AccountTeamMember acc = new AccountTeamMember();
            acc.AccountId = wrapper.accId;
            acc.UserId = ct.UserId;
            acc.TeamMemberRole = ct.TeamMemberRole;
            acc.AccountAccessLevel = ct.AccountAccessLevel;
            acc.CaseAccessLevel = ct.CaseAccessLevel;
            acc.OpportunityAccessLevel = ct.OpportunityAccessLevel;

            team.add(acc);
          }
          upsert team;
        }
      }
    } catch (Exception ex) {
      throw new AuraHandledException(ex.getMessage());
    }
  }
  @AuraEnabled(cacheable=true)
  public static List<User> getAllUsers() {
    return [
      SELECT Id, Name, IsProfilePhotoActive
      FROM User
      WHERE IsProfilePhotoActive = :true
    ];
  }
  @AuraEnabled(cacheable=true)
  public static List<String> getProduct() {
    List<String> pickListValuesList = new List<String>();
    Schema.DescribeFieldResult fieldResult = AccountTeamMember.TeamMemberRole.getDescribe();
    List<Schema.PicklistEntry> ple = fieldResult.getPicklistValues();
    for (Schema.PicklistEntry pickListVal : ple) {
      pickListValuesList.add(pickListVal.getLabel());
    }
    return pickListValuesList;
  }

  @AuraEnabled
  public static ConnectApi.Photo updateUser(String userId, String documentId) {
    try {
      ConnectApi.Photo photo = ConnectApi.UserProfiles.setPhoto(
        null,
        userId,
        documentId,
        null
      );

      return photo;
    } catch (Exception ex) {
      throw new AuraHandledException(ex.getMessage());
    }
  }

  @AuraEnabled
  public static List<AccountTeamMember> getDefaultTeam(String accRecordId) {
    List<UserAccountTeamMember> defList = [
      SELECT
        Id,
        UserId,
        AccountAccessLevel,
        OpportunityAccessLevel,
        CaseAccessLevel,
        ContactAccessLevel,
        TeamMemberRole
      FROM UserAccountTeamMember
    ];

    List<AccountTeamMember> defaTeamInsert = new List<AccountTeamMember>();
    for (UserAccountTeamMember defAcc : defList) {
      AccountTeamMember acc = new AccountTeamMember();
      acc.AccountId = accRecordId;
      acc.UserId = defAcc.UserId;
      acc.TeamMemberRole = defAcc.TeamMemberRole;
      acc.AccountAccessLevel = defAcc.AccountAccessLevel;
      acc.CaseAccessLevel = defAcc.CaseAccessLevel;
      acc.OpportunityAccessLevel = defAcc.OpportunityAccessLevel;

      defaTeamInsert.add(acc);
    }
    insert defaTeamInsert;
    return defaTeamInsert;
  }

  @AuraEnabled
  public static String deleteMemberRecord(List<Id> selectedRecordsId) {
    List<AccountTeamMember> listMember = [
      SELECT Id
      FROM AccountTeamMember
      WHERE Id IN :selectedRecordsId
    ];
    delete listMember;
    return 'sucess';
  }
}


