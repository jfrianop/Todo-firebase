// Your web app's Firebase configuration
var firebaseConfig = {
	apiKey: "AIzaSyA34_kNNkJ6kTmtVvUdG-3dLJcHWMkirMc",
	authDomain: "to-do-c3de2.firebaseapp.com",
	databaseURL: "https://to-do-c3de2.firebaseio.com",
	projectId: "to-do-c3de2",
	storageBucket: "",
	messagingSenderId: "451671717472",
	appId: "1:451671717472:web:b5243fed2e173935a17505",
	measurementId: "G-QKNHCZ76SX"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

var db = firebase.firestore();

var currentUser;

class Task {
	constructor(toDo) {
		this.id = toDo.id
		this.title = toDo.data().name
		this.done = toDo.data().done
	}

	addToList() {
		$('ul.elements').append(
			'<li> <p id="' +
			this.id +
			'">' +
			this.title +
			'</p><button class="delete-button" id="' +
			this.id +
			'"> X </button> </li>'
		)
		if (this.done) {
			$('#' + this.id).addClass('marked')
		} else {
			$('#' + this.id).removeClass('marked')
		}
	}
}

//GET todo from server
const loadToDo = function () {
	return db.collection("tasks").where("user", "==", currentUser).get();
}

//Declares Task objects from the todo loaded from server
const loadTask = function (toDoList) {
	let taskList = []
	console.log(toDoList);
	toDoList.forEach((toDo) => {
		taskList.push(new Task(toDo))
	})

	displayTasks(taskList)
}

//Displays eack task from tasklist
const displayTasks = function (taskList) {
	$('ul.elements').html('')
	taskList.forEach((task) => {
		task.addToList()
	})
}

//Initial Loader
const initialList = function () {
	loadToDo().then((e) => loadTask(e))
}

//POST task to server
const postTask = function (taskTitle) {
	var data = { name: taskTitle, user: currentUser, done: false }

	db.collection("tasks").add(data)
		.then(function (docRef) {
			console.log("Task added with id: ", docRef.id);
			initialList();
		})
		.catch(function (error) {
			console.error("Error adding Task: ", error);
		});
}

//PATCH task done status to server
const patchTask = function (taskDone, taskId) {

	db.collection("tasks").doc(taskId).set({
		done: taskDone
	}, { merge: true }).then(() => initialList());

}

//DELETE task from server
const deleteTask = function (taskId) {
	db.collection("tasks").doc(taskId).delete().then(() => initialList());
}

//Authentication
$("form").on("submit", function (e) {
	e.preventDefault();

	var email = $("#exampleInputEmail1").val();
	var password = $("#exampleInputPassword1").val();

	firebase.auth().signInWithEmailAndPassword(email, password)
		.catch(function (error) {
			console.log("Error code: ", error.code);
			console.log("Error message:", error.message);
			alert("Nombre de usuario o contraseña no válido.");
		});
});

firebase.auth().onAuthStateChanged(function (user) {
	if (user) {
		db.collection("users").doc(user.uid).get().then((e) => {
			currentUser = e.id;
			$(".login").hide();
			$(".wrapper").show();
			initialList();
		})
	} else {
		$(".wrapper").hide();
		alert("Nombre de usuario o contraseña no válido.");
	}
});

//Jquery listeners
$(document).ready(initialList)

$('#new-task').on('keypress', function (e) {
	if (e.which === 13) {
		postTask($('#new-task').val())
		$('#new-task').val('')
	}
})

$('ul').on('click', 'li p', function (e) {
	let taskId = $(this).attr('id')
	patchTask(!$(this).hasClass('marked'), taskId)
})

$('ul').on('click', 'li button', function (e) {
	deleteTask($(this).attr('id'))
})
