'use strict';

/* Controllers */

 

angular.module('myApp.controllers', [])


    .controller('pagesController', ['$scope','$http', function( $scope,  $http ) {

        $scope.pages = [

               { label:"Review", url:"#/states-review", selected:true },
               { label:"Quiz", url:"#/states-quiz", selected:false }

           ];

        $scope.setPage = function( targetPage ){

            for(var i=0; i < $scope.pages.length; i++ ){
                var page = $scope.pages[ i ];
                page.selected = ( page.url === targetPage.url );
            }
        }

        $scope.setPage( $scope.pages[ 0 ] );

    } ])

	.controller('statesReviewController', ['$scope','$http','$sce', function( $scope,  $http, $sce ) {

 	$scope.searchTerm;

 	$scope.clearStateSelection= function(){

 		var filtered = $scope.states.filter( $scope.filterStatesList );
 		$scope.currentState = ( filtered.length === 1) ? filtered[0] : null; 
 
 	}

 	$scope.clearSearch = function(){
 		$scope.searchTerm = "";
 		$scope.clearStateSelection();
 	}

 	$scope.filterStatesList = function( element ) {
 		var re = new RegExp( $scope.searchTerm, "i" );

 		return element.name.match(re) ||
 				element.abbreviation.match(re) ||
 				 element.capital.match(re) ||
 				  element.region.match(re);

	  ;
	};

	$scope.states = [];

	$http.get('data/states-data.js?8')
       .then(function(res){
          $scope.states = res.data;  
          $scope.selectState( $scope.states[0] );

        });


	$scope.stateMapURI = "";

	$scope.currentState = null;
	//var fillOn = "#9DB68C";
	//var fillOff = "#F5DEB3";


	$scope.selectState = function( state ){

		


		
		//if( $currentState ) {
		//	$currentState.css( "fill", fillOff );
		//}
		
		if( $scope.currentState ) {
			$scope.currentState.selected = false;
		}

		//var $state = $( "#" + state.abbreviation + "_1_");

		//$state.css( "fill", fillOn );
		
		state.selected = true;



		$scope.currentState = state;
		//$lastState = $state;

	}

	function selectStateByName( name ){
		for(var index=0; index < $scope.states.length; index++ ){
			var state = $scope.states[ index ];
			if( state.name === name ){
				$scope.selectState( state );

				break;
			}
		}

	}

	$scope.selectStateByAbbreviation = function( $event ){
		var element = $event.srcElement;
		var abbr = element.getAttribute( "id" ).substr(0,2);

		

		for(var index=0; index < $scope.states.length; index++ ){
			var state = $scope.states[ index ];
			if( state.abbreviation == abbr ){
				$scope.selectState( index );

				break;
			}
		}

		//$location.hash( abbr );
		//$anchorScroll();
	}




    }])

    .controller('statesQuizController', ['$scope','$http','$sce', function( $scope,  $http, $sce ) {



        $scope.states = [];

        $http.get('data/states-data.js?8')
            .then(function(res){
                $scope.states = res.data;

            })
            .then( function(){
                $scope.activeRegion =  $scope.regions[ 0 ];
                establishFilteredAnswerSet();
            });


       $scope.selectState = function( state ){

            if( $scope.currentState ) {
                $scope.currentState.selected = false;
            }

            state.selected = true;
            $scope.currentState = state;

        }

        function selectStateByName( name ){
            for(var index=0; index < $scope.states.length; index++ ){
                var state = $scope.states[ index ];
                if( state.name === name ){
                    $scope.selectState( state );

                    break;
                }
            }

        }




        $scope.currentScore = 0;

        $scope.question = "";
        $scope.answers = [];
        $scope.answer;

        $scope.revealChoices = true;

        $scope.correctAnswerIndex;
        $scope.incorrect = false;
        $scope.correct = false;
        $scope.ttqa ="";

        $scope.doRevealChoices = function(){
            $scope.revealChoices = true;
        }

        function shuffle(array) {
            var currentIndex = array.length
                , temporaryValue
                , randomIndex
                ;

            // While there remain elements to shuffle...
            while (0 !== currentIndex) {

                // Pick a remaining element...
                randomIndex = Math.floor(Math.random() * currentIndex);
                currentIndex -= 1;

                // And swap it with the current element.
                temporaryValue = array[currentIndex];
                array[currentIndex] = array[randomIndex];
                array[randomIndex] = temporaryValue;
            }

            return array;
        }

        var questions = [

            { 	text: "What is the capital of %STATE%?",
                concept: "capital",
                ttqa: "<b>%CAPITAL%</b> is the capital of <b>%STATE%</b>!"},

            { 	text: "What is the abbreviation for %STATE%?",
                concept: "abbreviation",
                ttqa: "<b>%ABBREVIATION%</b> is the abbreviation for <b>%STATE%</b>!"},

            { 	text: "%CAPITAL% is the capitol of which state?",
                concept: "name",
                ttqa: "<b>%CAPITAL%</b> is <b>%STATE%'s</b> state capital!"},

            { 	text: "Which state is this?",
                concept: "name",
                ttqa: "That is <b>%STATE%</b>!"}
        ]

        function getRandomState( states ){

            var i = parseInt( Math.random() *50 );
            var state = $scope.states[ i ];
            var isDuplicate = false;

            for( var i = 0; i < states.length; i++){
                if( state.name  === states[ i ].name ){
                    isDuplicate = true;
                }
            }

            if( isDuplicate ) {
                return getRandomState( states );
            } else {
                return state;
            }


        }

        function getSimilarState( state, states ){

            var root = state.abbreviation.substr(0,1);

            var similars = [];

            for(var i=0; i<$scope.states; i++){

                var state = $scope.states[i];

                if( state.abbreviation.indexOf(root) == 0 ){
                    similars.push( state );
                }
            }

            var index = parseInt( Math.random() * similars.length );

            return similars[ index ];


        }



        $scope.answerSet=[];




        function establishFilteredAnswerSet(){


            $scope.answerSet = $scope.states.filter(function (state) {
                return ( $scope.activeRegion.label == "All Regions" || $scope.activeRegion.label == state.region ) ? true : false;
            });

            shuffle( $scope.answerSet );

        }


        $scope.nextQuestion = function(){




            $scope.incorrect = false;
            $scope.correct = false;
            $scope.ttqa = "";
            $scope.revealChoices = false;

            var questionIndex = parseInt( Math.random() * questions.length );
            var question = questions[ questionIndex ];

            //var answerKey = 0; //parseInt( Math.random() * answers.length );
            var answer = jQuery.extend({}, $scope.answerSet.shift() );
            var correctAnswer = answer;
            answer.label = answer[ question.concept ];
            $scope.answerSet.push( answer );

            var answers = [ answer ];

            for( var i =1; i < 4; i++ ) {
                var state = getRandomState( answers );
                var a = jQuery.extend({}, state);
                a.label = a[ question.concept ];
                a.selected=false;
                answers.push( a );
            }

            shuffle(answers);





            //console.log(answers)

            selectStateByName( correctAnswer.name );


            $scope.question = question.text.replace( "%STATE%", correctAnswer.name ).replace( "%CAPITAL%", correctAnswer.capital ).replace( "%ABBREVIATION%", correctAnswer.abbreviation );

            $scope.ttqa =
                $sce.trustAsHtml( question.ttqa.replace( "%STATE%", correctAnswer.name ).replace( "%CAPITAL%", correctAnswer.capital ).replace( "%ABBREVIATION%", correctAnswer.abbreviation )  );

            $scope.answers = answers;
            $scope.correctAnswer = correctAnswer;
            //$scope.answerIndex = answerIndex;
            //$scope.correctAnswerKey = answerKey;


        }

        $scope.checkAnswer = function( answer ){
            //alert( answerKe + ":" +  $scope.correctAnswerKey )
            if( answer.name === $scope.correctAnswer.name ){
                $scope.incorrect = false;
                $scope.correct = true;
                $scope.currentScore ++;
            } else {
                $scope.incorrect = true;
                $scope.correct = false;
                $scope.currentScore--;
            }

        }



        $scope.regions= [

            { label:"All Regions", selected:true},
            { label:"West Region", selected:false},
            { label:"Midwest Region", selected:false},
            { label:"South Region", selected:false},
            { label:"Northeast Region", selected:false}
        ];

        $scope.setRegion = function( targetRegion ){

            for(var i=0; i < $scope.regions.length; i++ ){
                var region = $scope.regions[ i ];
                region.selected = ( region.label === targetRegion.label );
                if(region.selected){
                    $scope.activeRegion = region;
                }
            }
            establishFilteredAnswerSet();
            $scope.nextQuestion();

        }






    }]);


