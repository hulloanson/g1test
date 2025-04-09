var HIDDEN_CLASS = "hidden";
window.addEventListener("load", function () {
  var progressStore = new ProgressStore();
  var progress = progressStore.getProgress();
  if (progress) {
    $("#resume").removeClass(HIDDEN_CLASS);
    $("#start-anew-text").removeClass(HIDDEN_CLASS);
  }

  const store = new AnswersStore();
  const wronglyAnswered = store.getWronglyAnswered();
  if (wronglyAnswered.length !== 0) {
    $("#review-wrong").removeClass(HIDDEN_CLASS);
  }
});
