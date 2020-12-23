const todoController = (() => {
  class Item {
    constructor(id, description, priority, status) {
      this.id = id;
      this.description = description;
      this.priority = priority;
      this.status = status;
    }
  }

  let data = {
    items: [],
    updatingId: -1
  }

  return {
    addItem: (description, priority) => {
      let id = 1;
      if (data.items.length > 0) {
        id = parseInt(data.items[data.items.length - 1].id, 10) + 1;
      }

      if (description !== '') {
        let item = new Item(id, description, priority, 'todo');
        data.items.push(item);
      }
    },

    deleteItem: id => {
      data.items.splice(data.items.findIndex(el => {
        return el.id === id;
      }), 1);
    },

    updateItem: (id, description, priority, status) => {
      let index = data.items.findIndex(el => {
        return el.id == id;
      });

      data.items[index].description = description;
      data.items[index].priority = priority;
      data.items[index].status = status;
    },

    getItems: (status) => {
      return data.items.filter(item => {
        if (item.status === status) return item;
      });
    },

    getItem: id => {
      return data.items.find(el => el.id == parseInt(id));
    },

    getUpdatingId: () => {
      return data.updatingId;
    },

    setUpdatingId: id => {
      data.updatingId = id;
    }
  }
})();

const UIController = (() => {
  const DOMstrings = {
    todoItemsContainer: '.todo-items',
    doneItemsContainer: '.done-items',
    addItemButton: '#add',
    addDescriptionField: '#item__description--value',
    addPriorityField: '#item__priority--value',
    updateItemButton: '.update-item-button'
  }

  const clearTodoItemsList = () => {
    document.querySelector(DOMstrings.todoItemsContainer).innerHTML = '';
  }

  const clearDoneItemsList = () => {
    document.querySelector(DOMstrings.doneItemsContainer).innerHTML = '';
  }

  const removeUpdateButton = () => {
    let updateButton = document.querySelector(DOMstrings.updateItemButton);
    if (updateButton) {
      updateButton.parentNode.removeChild(updateButton);
    }
  }

  const renderUpdateButton = () => {
    const markup = `<button class="btn btn-info mt-4 update-item-button">Update task</button>`;
    document.querySelector('.form-container').insertAdjacentHTML('beforeend', markup);
  }

  return {
    getDOMStrings: () => {
      return DOMstrings;
    },

    getInputs: () => {
      return {
        description: document.querySelector(DOMstrings.addDescriptionField).value,
        priority: document.querySelector(DOMstrings.addPriorityField).value
      }
    },

    renderTodoItems: items => {
      clearTodoItemsList();

      items.forEach(el => {
        const markup = `
          <li class="list-group-item" data-itemid="${el.id}">
            ${el.description} - ${el.priority.toUpperCase()}
            <button type="button" class="btn btn-danger float-end ms-1 delete-item">Delete</button>
            <button type="button" class="btn btn-info float-end ms-1 update-item">Edit</button>
            <button type="button" class="btn btn-success float-end ms-1 move-to-done">Move to Done</button>
          </li>
        `;

        document.querySelector(DOMstrings.todoItemsContainer).insertAdjacentHTML('afterbegin', markup);
      });
    },

    renderDoneItems: items => {
      clearDoneItemsList();

      if (items.length > 0) {
        items.forEach(el => {
          const markup = `
            <li class="list-group-item" data-itemid="${el.id}">
              ${el.description} - ${el.priority.toUpperCase()}
              <button type="button" class="btn btn-danger float-end delete-item">Delete</button>
            </li>
          `;

          document.querySelector(DOMstrings.doneItemsContainer).insertAdjacentHTML('afterbegin', markup);
        });
      }
    },

    clearInputFields: () => {
      document.querySelector(DOMstrings.addDescriptionField).value = '';
    },

    removeItem: id => {
      let item = document.querySelector(`[data-itemid="${id}"]`);
      item.parentNode.removeChild(item);
    },

    fillValueFields: (description, priority) => {
      document.querySelector(DOMstrings.addDescriptionField).value = description;
      document.querySelector(DOMstrings.addPriorityField).value = priority;

      renderUpdateButton();
    },

    removeUpdateButton: () => {
      removeUpdateButton();
    }
  }
})();

const controller = ((todoCtrl, UIctrl) => {
  const addItem = () => {
    const descriptionValue = UIctrl.getInputs().description;
    const priorityValue = UIctrl.getInputs().priority;

    todoCtrl.setUpdatingId(-1);
    todoCtrl.addItem(descriptionValue, priorityValue);

    UIctrl.clearInputFields();
    UIctrl.renderTodoItems(todoCtrl.getItems('todo'));
  }

  const moveToDone = id => {
    let item = todoCtrl.getItem(id);
    todoCtrl.updateItem(id, item.description, item.priority, 'done');

    UIctrl.renderTodoItems(todoCtrl.getItems('todo'));
    UIctrl.renderDoneItems(todoCtrl.getItems('done'));
  }

  const deleteItem = id => {
    todoCtrl.deleteItem(id);
    UIctrl.removeItem(id);
  }

  const prepareUpdateItem = id => {
    let item = todoCtrl.getItem(id);

    UIctrl.fillValueFields(item.description, item.priority);
    todoCtrl.setUpdatingId(id);
  }

  const updateItem = id => {
    todoCtrl.updateItem(id, UIctrl.getInputs().description, UIctrl.getInputs().priority, 'todo');
    todoCtrl.setUpdatingId(-1);
    UIctrl.clearInputFields();
    UIctrl.removeUpdateButton();
    UIctrl.renderTodoItems(todoCtrl.getItems('todo'));
  }

  const setupEventListeners = () => {
    let DOM = UIctrl.getDOMStrings();

    document.querySelector(DOM.addItemButton).addEventListener('click', e => {
      e.preventDefault();

      UIctrl.removeUpdateButton();
      addItem();
    });

    document.querySelector(DOM.todoItemsContainer).addEventListener('click', e => {
      if (e.target.classList.contains('move-to-done')) {
        const id = parseInt(e.target.parentNode.dataset.itemid, 10);

        moveToDone(id);
      } else if (e.target.classList.contains('delete-item')) {
        const id = parseInt(e.target.parentNode.dataset.itemid, 10);

        deleteItem(id);
      } else if (e.target.classList.contains('update-item')) {
        const id = parseInt(e.target.parentNode.dataset.itemid, 10);

        prepareUpdateItem(id);
      }
    });

    document.querySelector(DOM.doneItemsContainer).addEventListener('click', e => {
      if (e.target.classList.contains('delete-item')) {
        const id = parseInt(e.target.parentNode.dataset.itemid, 10);

        deleteItem(id);
      }
    });

    document.querySelector('.form-container').addEventListener('click', e => {
      e.preventDefault();

      if (e.target.classList.contains('update-item-button')) {
        updateItem(todoCtrl.getUpdatingId());
      }
    });
  }

  return {
    init: () => {
      console.log('Application has started.');
      setupEventListeners();
    },
    test: () => {
      return todoCtrl.getItems('todo')
    }
  }
})(todoController, UIController);

controller.init();
