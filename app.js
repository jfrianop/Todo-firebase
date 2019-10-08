class Task {
	constructor(toDo) {
		this.id = toDo.id
		this.title = toDo.title
		this.done = toDo.done
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
	const toDoList = fetch('http://makeitreal-todo.herokuapp.com/todo_items').then(function (response) {
		return response.json()
	})
	return toDoList
}

//Declares Task objects from the todo loaded from server
const loadTask = function (toDoList) {
	let taskList = []
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
	var url = 'http://makeitreal-todo.herokuapp.com/todo_items'
	var data = { title: taskTitle }

	fetch(url, {
		method: 'POST', // or 'PUT'
		body: JSON.stringify(data), // data can be `string` or {object}!
		headers: {
			'Content-Type': 'application/json'
		}
	})
		.then((res) => res.json())
		.catch((error) => console.error('Error:', error))
		.then(() => initialList())
}

//PATCH task done status to server
const patchTask = function (taskDone, taskId) {
	var url = 'http://makeitreal-todo.herokuapp.com/todo_items/' + taskId
	var data = { done: taskDone }

	fetch(url, {
		method: 'PATCH', // or 'PUT'
		body: JSON.stringify(data), // data can be `string` or {object}!
		headers: {
			'Content-Type': 'application/json'
		}
	}).then(() => initialList())
}

//DELETE task from server
const deleteTask = function (taskId) {
	var url = 'http://makeitreal-todo.herokuapp.com/todo_items/' + taskId

	fetch(url, {
		method: 'DELETE', // or 'PUT'
		headers: {
			'Content-Type': 'application/json'
		}
	}).then(() => initialList())
}


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
