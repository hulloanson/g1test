window.addEventListener("load", function () {
  var progressStore = new ProgressStore();
  var progress = progressStore.getProgress();
  if (progress) {
    $("#resume-button").css("display", "");
    $("#start-anew-text").css("display", "");
  }

  const store = new AnswersStore();
  const wronglyAnswered = store.getWronglyAnswered();
  if (wronglyAnswered.length !== 0) {
    $("#review-wrong-button").css("display", "");
  }
});
