namespace susaas;

using { cuid, managed } from '@sap/cds/common';

entity Projects : cuid, managed {
  title       : String(100) @mandatory;
  description : String(500);
  members     : Composition of many Members on members.project = $self;
  assessments : Composition of many Assessments on assessments.project = $self;
}

entity Members : cuid {
  project : Association to Projects;
  userId  : String(100) @mandatory;
  role    : String(20) default 'Member';
}

entity Assessments : cuid, managed {
  project     : Association to Projects;
  description : String(200);
  score       : Integer;
}
