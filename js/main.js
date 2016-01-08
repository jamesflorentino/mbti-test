angular.module('app', [])
  .controller('MainCtrl', function($scope, $http) {
    try {
      $scope.answers = JSON.parse(window.localStorage.answers);
    } catch (e) {
      console.log(e);
      $scope.answers = [];
    } finally {}
    // $scope.answers = [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 1, 1, 0, 0, 0, 1, 1, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1, 1, 1, 0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 0, 0, 1, 1, 0, 0, 1, 0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1];
    $scope.title = "Find your MBTI";
    $scope.answer = function(selection, question, $event) {
      $event.preventDefault();
      if (question.selected) {
        question.selected.selected = false;
      }

      question.selected = selection;
      question.answer = selection.i;
      question.selected.selected = true;
    };

    $scope.submit = function($event) {
      var answers = $scope.questions.map(function(question) {
        return question.answer;
      });
      window.localStorage.answers = JSON.stringify(answers);
      // console.log(answers);
    };

    function compareScore(a, b) {
      var sum = a + b;
      var result = {};
      result[a] = (a / sum * 100).toFixed(2);
      result[b] = (b / sum * 100).toFixed(2);
      return result;
    }

    function calculateResult() {
      // E/I, S/N, T/F, J/P
      // 1,   2,   4,   4
      var scores = {
        E: 0,
        I: 0,
        S: 0,
        N: 0,
        T: 0,
        F: 0,
        J: 0,
        P: 0
      };
      $scope.answers.forEach(function(answer, i) {
        var type = (i + 1) % 4;
        switch (type) {
          case 1: // E/I
            if (answer === 0) {
              scores.E++;
            } else {
              scores.I++;
            }
            break;
          case 2: // S/N
            if (answer === 0) {
              scores.S++;
            } else {
              scores.N++;
            }
            break;
          case 3: // T/F
            if (answer === 0) {
              scores.T++;
            } else {
              scores.F++;
            }
            break;
          case 0: // J/P
            if (answer === 0) {
              scores.J++;
            } else {
              scores.P++;
            }
            break;
        }
      });

      // console.log(scores.E > scores.I ? 'E' : 'I', compareScore(scores.E, scores.I));
      // console.log(scores.S > scores.N ? 'S' : 'N', compareScore(scores.S, scores.N));
      // console.log(scores.T > scores.F ? 'T' : 'F', compareScore(scores.T, scores.F));
      // console.log(scores.J > scores.P ? 'J' : 'P', compareScore(scores.J, scores.P));
      // console.log(scores);

      var typeMatrix = [
        ['E','I'],
        ['S','N'],
        ['T','F'],
        ['J','P']
      ];

      var typeRefs = {
        'E': 'Extravert',
        'I': 'Introvert',
        'S': 'Sensor',
        'N': 'Intuitive',
        'T': 'Thinker',
        'F': 'Feeler',
        'P': 'Perceiver',
        'J': 'Judger'
      };

      var resultType = typeMatrix.map(function(arr) {
        var a = arr[0];
        var b = arr[1];
        var type = scores[a] > scores[b] ? a : b;
        var totalScore = scores[a] + scores[b];

        return {
          type: type,
          typeName: typeRefs[type],
          percentage: Math.round(scores[type] / totalScore * 100)
        };
      });

      // var resultType = [
      //   scores.E > scores.I ? 'E' : 'I',
      //   scores.S > scores.N ? 'S' : 'N',
      //   scores.T > scores.F ? 'T' : 'F',
      //   scores.J > scores.P ? 'J' : 'P'
      // ];

      $scope.result = {
        type: resultType.map(function(t) {
          return t.type;
        }).join(''),
        scores: scores,
        traits: resultType
      };

    }

    $http.get('list.json')
      .then(function(response) {
        var data = response.data;
        var questions = data.questions.map(function(question, i) {
          question.selections = question.selections.map(function(title, i) {
            return {
              label: title,
              i: i,
              selected: false
            };
          });
          question.i = i + 1;
          return question;
        });

        // fill inm questions
        questions.forEach(function(question, i) {
          var answer = $scope.answers[i];
          question.answer = answer;
          question.selections.forEach(function(selection, i) {
            if (i === answer) {
              question.selected = selection;
              selection.selected = true;
            }
          });
        });

        if ($scope.answers.length === questions.length) {
          calculateResult();
        }

        $scope.questions = questions;
      });
  });
