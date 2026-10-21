using { susaas as db } from '../db/schema';

service AdminService @(path: '/admin', requires: 'Admin') {
  entity Projects as projection on db.Projects;
  entity Members  as projection on db.Members;
}

service PublicService @(path: '/public', requires: ['Admin', 'Member']) {

  @restrict: [
    { grant: 'READ', to: 'Admin' },
    { grant: 'READ', to: 'Member', where: 'exists members[userId = $user]' }
  ]
  entity Projects as projection on db.Projects;

  @odata.draft.enabled
  @restrict: [
    { grant: '*', to: 'Admin' },
    { grant: '*', to: 'Member', where: 'exists project.members[userId = $user]' }
  ]
  entity Assessments as projection on db.Assessments;
}
