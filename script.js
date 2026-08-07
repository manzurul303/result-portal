// Function to switch between Individual and Institution Tabs
function switchTab(tabName) {
  const individualTab = document.getElementById('individualTab');
  const institutionTab = document.getElementById('institutionTab');
  const tabIndividualBtn = document.getElementById('tab-individual');
  const tabInstitutionBtn = document.getElementById('tab-institution');

  if (tabName === 'individual') {
    individualTab.classList.remove('hidden');
    institutionTab.classList.add('hidden');
    tabIndividualBtn.classList.add('active');
    tabInstitutionBtn.classList.remove('active');
  } else if (tabName === 'institution') {
    institutionTab.classList.remove('hidden');
    individualTab.classList.add('hidden');
    tabInstitutionBtn.classList.add('active');
    tabIndividualBtn.classList.remove('active');
  }
}