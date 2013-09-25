define(function(require){

	var storage = {
			domain : 'https://thght.s3.amazonaws.com',
			cdn    : 'http://d2r15t4srb10nb.cloudfront.net'
		},
		front = [
			'/img/characterDefaultImage/angry_cat.jpg',
			'/img/characterDefaultImage/gentle_cat.jpg',
			'/img/characterDefaultImage/happy_cat.jpg',
			'/img/characterDefaultImage/hate_cate.jpg',
			'/img/characterDefaultImage/sad_dog.jpg'
		],
		back = [
			'/img/characterDefaultImage/sunflower.jpg',
			'/img/characterDefaultImage/wall.jpg',
			'/img/characterDefaultImage/whywe.jpg',
			'/img/characterDefaultImage/rainy.jpg'
		],
		emotion = [
			'Excited', 'Ecstatic', 'Aroused', 'Bouncy', 'Nervous', 'Perky', 'Antsy', 'Sad', 'Down', 'Blue', 'Depressed', 'Heart-Broken', 'Happy', 'Pleased', 'Optimistic', 'Complete', 'Satisfied', 'Contented', 'Tender', 'Intimate', 'Loving', 'Warm-Hearted', 'Touched', 'Kind', 'Soft', 'Scared', 'Tense', 'Angry', 'Irritated', 'Resentful', 'Miffed', 'Upset', 'Mad', 'Furious', 'Raging'
		],
		character = [
			'Man','Woman','Animal','Creature','Monkey','Gorilla','Chipmunk','Penguin','Chicken','Gerafe','Dog','Bear','Cat','Bird','Panda','Whail','Dolfin','Pig','Cow','Hamster','Mouse','Fish','Chempange','Snake','Dear','Tiger','Lion'
		],
		itemPerPage = 5;
	
	return {
		language : 'en',
		storage : storage,
		newName : function(){
			var newEmotion = emotion[Math.floor(Math.random() * emotion.length)],
				newCharacter = character[Math.floor(Math.random() * character.length)];
			return newEmotion + ' ' + newCharacter;
		},
		characterDefaultImage : {
			front : function(){
				return front[Math.floor(Math.random() * front.length)];
			}(),
			back : function(){
				return back[Math.floor(Math.random() * back.length)];
			}()
		},
		defaultMoment : function(id){
			return {
				id      : id,
				options : [
					{ value : '-1', text : 'Moments', selected : true },
					{ value : 'Excited', text : 'Excited', selected : false },
					{ value : 'Tender', text : 'Tender', selected : false },
					{ value : 'Happy', text : 'Happy', selected : false },
					{ value : 'Sad', text : 'Sad', selected : false },
					{ value : 'Angry', text : 'Angry', selected : false },
					{ value : 'Scared', text : 'Scared', selected : false }
					// { value : 'Break-up', text : 'Break up', selected : false },
					// { value : 'Hate', text : 'Hate', selected : false },
					// { value : 'Sad', text : 'Sad', selected : false },
					// { value : 'Love', text : 'Love', selected : false },
					// { value : 'Happy', text : 'Happy', selected : false },
					// { value : 'inspiration', text : 'inspiration', selected : false }
				]

			}
		},
		itemPerPage : itemPerPage
	}
});
