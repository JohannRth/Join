/**
 * Allows the drop event by preventing the default behavior.
 * @param {DragEvent} ev - The drag event.
 */
function allowDrop(ev) {
    ev.preventDefault();
}

/**
 * Main function that delegates event handling based on event type.
 * @param {Event} ev - The event object.
 */
function dragTask(ev) {
    if (ev.type === "dragstart") {
        handleMouseDragStart(ev);
    } else if (ev.type === "touchstart") {
        handleTouchStart(ev);
    }
}

/**
 * Handles mouse drag start events.
 * @param {DragEvent} ev - The drag event.
 */
function handleMouseDragStart(ev) {
    ev.dataTransfer.setData("text", ev.target.id);
    ev.target.classList.add("dragging");
    ev.target.style.cursor = "grabbing";

    ev.target.addEventListener("dragend", () => {
        const dragAreas = document.querySelectorAll(".drag-area");
        dragAreas.forEach((area) => area.classList.remove("highlight"));
    });
}

/**
 * Handles touch start events for touch-based dragging.
 * Initializes the touch context and binds event handlers.
 * @param {TouchEvent} ev - The touch event.
 */
function handleTouchStart(ev) {
    ev.preventDefault();
    const context = initializeTouchContext(ev);
    const { taskElement, offsetX, offsetY } = context;

    taskElement.classList.add("dragging");
    moveAt(taskElement, ev.touches[0].pageX, ev.touches[0].pageY, offsetX, offsetY);
    bindTouchEventHandlers(context);
}

/**
 * Initializes the touch context for touch dragging.
 * @param {TouchEvent} ev - The touch event.
 * @returns {Object} The touch context containing necessary data.
 */
function initializeTouchContext(ev) {
    const taskElement = ev.currentTarget;
    const touch = ev.touches[0];
    const offsetX = touch.clientX - taskElement.getBoundingClientRect().left;
    const offsetY = touch.clientY - taskElement.getBoundingClientRect().top;

    return {
        taskElement,
        offsetX,
        offsetY,
        currentDropTarget: null,
        onTouchMove: null,
        onTouchEnd: null
    };
}

/**
 * Binds touch event handlers for touchmove and touchend events.
 * @param {Object} context - The touch context.
 */
function bindTouchEventHandlers(context) {
    // Bind the functions to the context
    context.onTouchMove = function(e) {
        onTouchMove(e, context);
    };

    context.onTouchEnd = function(e) {
        onTouchEnd(e, context);
    };

    document.addEventListener('touchmove', context.onTouchMove, { passive: false });
    context.taskElement.addEventListener('touchend', context.onTouchEnd);
}

/**
 * Handles touch move events during dragging.
 * Moves the task element and updates drop area highlights.
 * @param {TouchEvent} e - The touch event.
 * @param {Object} context - The touch context.
 */
function onTouchMove(e, context) {
    e.preventDefault();
    const touch = e.touches[0];
    moveAt(context.taskElement, touch.pageX, touch.pageY, context.offsetX, context.offsetY);

    // Temporarily hide the task element to detect underlying elements
    context.taskElement.style.display = 'none';
    const touchElement = document.elementFromPoint(touch.clientX, touch.clientY);
    context.taskElement.style.display = '';

    const dropArea = touchElement ? touchElement.closest('.drag-area') : null;

    updateDropAreaHighlight(dropArea, context);
}

/**
 * Handles touch end events after dragging.
 * Drops the task into the appropriate drop area and updates the UI.
 * @param {TouchEvent} e - The touch event.
 * @param {Object} context - The touch context.
 */
function onTouchEnd(e, context) {
    const { taskElement, onTouchMove, onTouchEnd } = context;

    document.removeEventListener('touchmove', onTouchMove);
    taskElement.removeEventListener('touchend', onTouchEnd);

    // Remove highlight from the last drop area
    if (context.currentDropTarget) {
        context.currentDropTarget.classList.remove('highlight');
    }

    handleDrop(e, context);
    resetTaskElementStyles(taskElement);

    // Reset the current drop target
    context.currentDropTarget = null;
}

/**
 * Handles the drop logic when a task is dropped into a drop area.
 * @param {TouchEvent} e - The touch event.
 * @param {Object} context - The touch context.
 */
function handleDrop(e, context) {
    const { taskElement } = context;

    // Temporarily hide the task element to detect underlying elements
    taskElement.style.display = 'none';
    const touchPoint = e.changedTouches ? e.changedTouches[0] : e.touches[0];
    const dropTargetElement = document.elementFromPoint(touchPoint.clientX, touchPoint.clientY);
    taskElement.style.display = '';

    const dropTarget = dropTargetElement ? dropTargetElement.closest('.drag-area') : null;

    if (dropTarget) {
        dropTarget.appendChild(taskElement);
        savePosition(taskElement.id, dropTarget.id);

        // Update the task's category
        todos = todos.map(task =>
            task.id == taskElement.id ? { ...task, category: dropTarget.id } : task
        );

        // Update the display
        updateBoardCounts();
        updateHTML();
    }
}

/**
 * Resets the styles of the task element after dragging ends.
 * @param {HTMLElement} taskElement - The task element.
 */
function resetTaskElementStyles(taskElement) {
    taskElement.style.position = '';
    taskElement.style.zIndex = '';
    taskElement.style.left = '';
    taskElement.style.top = '';
    taskElement.classList.remove("dragging");
}

/**
 * Moves the task element to the specified position.
 * @param {HTMLElement} taskElement - The task element.
 * @param {number} pageX - The X coordinate on the page.
 * @param {number} pageY - The Y coordinate on the page.
 * @param {number} offsetX - The X offset from the touch point.
 * @param {number} offsetY - The Y offset from the touch point.
 */
function moveAt(taskElement, pageX, pageY, offsetX, offsetY) {
    taskElement.style.position = 'absolute';
    taskElement.style.zIndex = 1000;
    taskElement.style.left = pageX - offsetX + 'px';
    taskElement.style.top = pageY - offsetY + 'px';
}

/**
 * Updates the highlight state of drop areas during dragging.
 * @param {HTMLElement|null} dropArea - The current drop area element.
 * @param {Object} context - The touch context.
 */
function updateDropAreaHighlight(dropArea, context) {
    if (dropArea !== context.currentDropTarget) {
        // Remove highlight from the previous drop area
        if (context.currentDropTarget) {
            context.currentDropTarget.classList.remove('highlight');
        }
        // Add highlight to the new drop area
        if (dropArea) {
            dropArea.classList.add('highlight');
        }
        context.currentDropTarget = dropArea;
    }
}

/**
 * Handles the drop event for mouse-based dragging.
 * @param {DragEvent} ev - The drag event.
 */
function dropTask(ev) {
    ev.preventDefault();
    const targetArea = ev.target.closest(".drag-area");
    if (targetArea) {
        targetArea.classList.remove("highlight");
        const data = ev.dataTransfer.getData("text");
        const taskElement = document.getElementById(data);
        targetArea.appendChild(taskElement);

        savePosition(data, targetArea.id);
    }
}