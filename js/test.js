var randomizedArray = [];
var currentQuestion = "";
var currentQuestion = "";
var currentProgress;
var questionsTotal = "";
var questionsRight = 0;

var progressStore = new ProgressStore();
var answerStore = new AnswersStore();

/**
 * @callback getQuestionSetCb
 * @param {(null|Questions)} result - An array of questions. `null` if failed
 * @param {(null|Error)} error - Error if any. Indicates failure if not `null`
 */

/**
 * Get question set asynchronously.
 * @param {getQuestionSetCb} cb The callback
 */
function getQuestionSet(cb) {
  var httpRequest = new XMLHttpRequest();
  httpRequest.onload = () => {
    if (httpRequest.status == 200) {
      var questions = JSON.parse(httpRequest.responseText);
      cb(questions.questions, null);
    } else if (httpRequest.status == 404) {
      cb(null, new Error("Not found."));
    }
  };
  httpRequest.onerror = function () {
    cb(null, new Error("Request failed."));
  };
  httpRequest.open("GET", "questions.json", true);
  httpRequest.send();
}

function shouldResume() {
  const match = window.location.search.match(/(\?|&)resume(=1)?/);
  const hasResumeParam = !!match && match.length > 0;
  return hasResumeParam;
}

/**
 * Randomize given questions and return a new one
 * @param {Questions} questionSet
 * @returns {Questions} A new Array containing randomized questions from `questionSet`
 */
function shuffleSet(questionSet) {
  var randomized = [];

  // Create a randomized array of all the questions

  while (questionSet.length > 0) {
    var randomNumber = Math.floor(Math.random() * questionSet.length);
    randomized.push(questionSet[randomNumber]);
    questionSet.splice(randomNumber, 1);
  }
  return randomized;
}

/**
 * Initiate test.
 * @param {Questions} questions - Complete set of questions to test the user
 * @param {Progress} progress - Current progress
 */
function initTest(questions, progress) {
  currentProgress = progress.current;
  questionsTotal = progress.total;
  questionsRight =
    currentProgress - answerStore.getWronglyAnswered().length - 1;

  randomizedArray = questions.slice(progress.current - 1);

  setupAnswerCheck();

  nextSequence();
}

function resetStores() {
  answerStore.clear();
  progressStore.clear();
}

function redirectToMainPage() {
  this.window.location = "/";
}

function redirectToResume() {
  this.window.location = "/test.html?resume";
}

function redirectToNewTest() {
  resetStores();
  this.window.location = "/test.html";
}

function initNewTest() {
  getQuestionSet(function (questions, error) {
    if (error) {
      console.log(error.message);
    } else {
      var shuffled = shuffleSet(questions);
      resetStores();
      progressStore.startProgress(shuffled);
      initTest(shuffled, progressStore.getProgress());
    }
  });
}

window.addEventListener("load", function () {
  var progress = progressStore.getProgress();
  if (shouldResume() && progress) {
    initTest(progressStore.getQuestions(), progress);
  } else if (!shouldResume() && !progress) {

    initNewTest();
  } else if (shouldResume() && !progress) {
    alert("No progress saved. Click okay to go back.");
    redirectToMainPage();
  } else {
    window.confirm(
      "There is a save. Click okay to resume, cancel to start anew."
    )
      ? redirectToResume()
      : redirectToNewTest();
  }
});

function populateCount() {
  $("#answered").html(currentProgress);
  $("#remaining").html(questionsTotal);
  const wrongCount = currentProgress - questionsRight - 1;
  $("#wrong-count").html(wrongCount);
  if (wrongCount > 0) $("#review-wrong").addClass("has-wrong");
  $("#right-count").html(questionsRight);
}

function nextSequence() {
  if (randomizedArray.length == 0) {
    testFinished();
    return;
  }

  currentQuestion = randomizedArray.splice(0, 1)[0];

  $("#questionImage").attr("src", currentQuestion.image);
  $("#one").html(currentQuestion.one);
  $("#two").html(currentQuestion.two);
  $("#three").html(currentQuestion.three);
  $("#four").html(currentQuestion.four);
  $("#question-p").html(currentQuestion.question);

  populateCount();

  // Colapse image area if there is no image
  if (currentQuestion.image == "") {
    $("#questionImage").css("height", "3rem");
  } else {
    $("#questionImage").css("height", "15rem");
  }

  $(".answer input:checked").prop("checked", false);
  $("#question").css("opacity", "1");
}

function setupAnswerCheck() {
  $(".answer input").click(function () {
    if ($(".answer input:checked").val() == currentQuestion.answer) {
      // Display a check if right
      setTimeout(function () {
        $("#check").css("display", "block");
      }, 300);

      // Hide check
      setTimeout(function () {
        $("#check").css("display", "none");
      }, 1500);

      // Add one to the number of questions right
      questionsRight++;

      // Fade out the current question
      setTimeout(function () {
        $("#question").css("opacity", "0");
      }, 500);

      // Go to the next question
      setTimeout(function () {
        progressStore.saveProgress(++currentProgress);
        nextSequence();
      }, 1500);

      // Reset correct answer color
      setTimeout(function () {
        let selectedAnswer = $(".answer input:checked").parent();
        selectedAnswer.find(".check").css({ "background-color": "#defcf8" });
      }, 1700);
    } else {
      const selectedValue = $(".answer input:checked").val();
      answerStore.saveWrongAnswer(currentQuestion, selectedValue);

      // Display an X if wrong
      setTimeout(function () {
        $("#ex").css("display", "block");
      }, 300);

      // Show correct answer
      $("#" + currentQuestion.answer).css("color", "#cf142b");
      $("#" + currentQuestion.answer).css("font-weight", "900");

      // Hide X
      setTimeout(function () {
        $("#ex").css("display", "none");
      }, 1500);

      // Fade out current question
      setTimeout(function () {
        $("#question").css("opacity", "0");
      }, 500);

      // Go to next question
      setTimeout(function () {
        progressStore.saveProgress(++currentProgress);
        nextSequence();
      }, 1500);

      // Reset correct answer color
      setTimeout(function () {
        $("#" + currentQuestion.answer).css("color", "#e8eded");
        $("#" + currentQuestion.answer).css("font-weight", "400");
        let selectedAnswer = $(".answer input:checked").parent();
        selectedAnswer.find(".check").css({ "background-color": "#defcf8" });
      }, 500);

      // Reset selected answer colour
    }
  });
}

// Give a final score at the end with an option to restart the test
function testFinished() {
  progressStore.clear();
  $(".answer input").click(function () {
    setTimeout(function () {
      var totalScore = Math.round((questionsRight / questionsTotal) * 100);
      $("#question").css("display", "none");
      $("#results").css("display", "block");
      $("#percentage").html(totalScore + "%");
      $("#correct").html(questionsRight);
      $("#total").html(questionsTotal);
      $("#question-count").css("display", "none");
    }, 3000);
  });
}
