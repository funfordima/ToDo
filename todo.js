window.addEventListener('DOMContentLoaded', () => {

    const container = document.createElement('div');
    const input = document.createElement('input');
    const addBtn = document.createElement('button');
    const h1 = document.createElement('h1');
    const ul = document.createElement('ul');
    let todoList = [];
    let editing;

    container.classList.add('container');
    document.body.prepend(container);
    container.prepend(h1);
    container.append(input);
    input.classList.add('input');
    container.append(addBtn);
    addBtn.classList.add('addButton');
    ul.classList.add('todoList');
    container.append(ul);

    h1.textContent = 'To-Do App';
    input.setAttribute('placeholder', 'Enter new task');
    addBtn.textContent = 'Add';

    function displayTask() {
        ul.innerHTML = '';
        todoList.forEach((item) => {
            const li = document.createElement('li');
            const span = document.createElement('span');
            const actions = ['complete', 'save'];

            span.innerHTML = item.todo;
            li.append(span);
            actions.forEach((action) => {
                const btn = document.createElement('button');
                btn.textContent = action;
                btn.classList.add('button');
                li.append(btn);
            });
            ul.prepend(li);
        });

        todoList.forEach((item) => {
            if (item.isDone) {
                ul.querySelectorAll('li').forEach((element) => {
                    if (element.firstChild.textContent == item.todo) {
                        element.childNodes.forEach((el) => el.classList.add('complete'));
                    }

                    if (element.childNodes[1].classList.contains('complete')) {
                        element.childNodes[1].textContent = 'delete';
                    }
                });
            }

            if (item.isSave) {
                ul.querySelectorAll('li').forEach((element) => {
                    if (item.todo == element.firstChild.textContent) {
                        element.childNodes[2].textContent = 'undo';
                    }
                });
            }
        });
    }

    function addTodo(e) {
        const newTodo = {
            todo: input.value,
            isDone: false,
            isSave: false
        };

        todoList.push(newTodo);
        displayTask();
        e.target.previousElementSibling.value = '';
    }

    function makeEditable(item) {
        editing = {
            elem: item,
            data: item.innerHTML
        };

        item.classList.add('edit');

        const wrap = document.createElement('div');
        wrap.classList.add('modal');
        let input = document.createElement('input');
        input.style.position = 'relative';
        input.style.left = item.getBoundingClientRect().left + 'px';
        input.style.top = item.getBoundingClientRect().top + 'px';
        input.style.width = 220 + 'px';
        input.style.height = item.clientHeight + 2 + 'px';
        input.className = 'edit-area';
        input.value = item.innerHTML;
        item.innerHTML = '';

        item.append(wrap);
        wrap.append(input);
        input.focus();
        const div = document.createElement('div');
        div.classList.add('edit-btn');
        item.append(div);
        const btnOk = document.createElement('button');
        btnOk.classList.add('ok');
        btnOk.textContent = 'Ok';
        div.append(btnOk);
        const btnCancel = document.createElement('button');
        btnCancel.classList.add('cancel');
        btnCancel.textContent = 'cancel';
        div.append(btnCancel);
    }

    function finishEdit(item, isOk) {
        if (isOk) {
            let oldValue = editing.data;

            item.innerHTML = item.firstChild.firstChild.value;
            localStorage.removeItem('todo');
            todoList.forEach((i) => {
                if (i.todo == oldValue) {
                    i.todo = item.innerHTML;
                }
            });
            localStorage.setItem('todo', JSON.stringify(todoList));
        } else {
            item.innerHTML = editing.data;
        }

        item.classList.remove('edit');
        editing = null;
    }

    function mainActions(event) {
        const EL = event.target;

        if (EL.textContent == 'delete') {
            const element = EL.parentElement.firstElementChild;

            let oldTodoList = JSON.parse(localStorage.getItem('todo'));
            localStorage.removeItem('todo');

            oldTodoList = oldTodoList.filter((item) => item.todo !== element.textContent);
            localStorage.setItem('todo', JSON.stringify(oldTodoList));
            oldTodoList = null;

            EL.parentElement.remove();
        }

        if (EL.textContent == 'complete') {
            EL.textContent = 'delete';
            EL.nextElementSibling.textContent = 'save';
            todoList.forEach((item) => {
                if (item.todo == EL.parentElement.firstElementChild.textContent) {
                    item.isDone = 'true';
                    for (let elem of EL.parentElement.children) {
                        elem.classList.add('complete');
                    }
                }
            });
        }

        if (EL.textContent == 'save') {
            todoList.forEach((item) => {
                if (item.todo == EL.parentElement.firstElementChild.textContent) {
                    item.isSave = true;
                }
            });
            localStorage.setItem('todo', JSON.stringify(todoList));
            EL.textContent = 'undo';
            return;
        }

        if (EL.textContent == 'undo') {
            let oldTodoList = JSON.parse(localStorage.getItem('todo'));
            localStorage.removeItem('todo');
            EL.textContent = 'save';
            todoList.forEach((item) => {
                if (item.todo == EL.parentElement.firstElementChild.textContent) {
                    item.isDone = false;
                    for (let elem of EL.parentElement.children) {
                        elem.classList.remove('complete');
                        if (elem.textContent == 'delete') {
                            elem.textContent = 'complete';
                        }
                    }
                }
            });
            oldTodoList = oldTodoList.filter((item) => {
                return item.todo !== EL.parentElement.firstElementChild.textContent
            });
            localStorage.setItem('todo', JSON.stringify(oldTodoList));
            oldTodoList = null;
        }

        if (EL.classList.contains('cancel')) {
            finishEdit(editing.elem, false);
        } else if (EL.classList.contains('ok')) {
            finishEdit(editing.elem, true);
        } else if (EL.nodeName == 'SPAN') {
            if (editing) {
                return;
            }
            makeEditable(EL);
        }
    }

    if (localStorage.getItem('todo')) {
        todoList.push(...JSON.parse(localStorage.getItem('todo')));
        displayTask();
    }

    addBtn.addEventListener('click', addTodo);
    ul.addEventListener('click', mainActions);
});


