/**
 * Main function that delegates processing based on the event type.
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
 * Handles touch start events.
 * @param {TouchEvent} ev - The touch event.
 */
function handleTouchStart(ev) {
    const context = initializeTouchContext(ev);
    // Start the long press timer
    startLongPressTimer(context, ev);
    // Bind the event handlers
    bindTouchEventHandlers(context);
}

/**
 * Initializes the touch context for dragging.
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
        onTouchEnd: null,
        isDragging: false,
        touchStartTime: Date.now(),
        touchDurationThreshold: 500, // Duration in ms for long press
        touchTimeout: null
    };
}

/**
 * Starts the timer for the long press to distinguish between tap and long press.
 * @param {Object} context - The touch context.
 * @param {TouchEvent} ev - The touch event.
 */
function startLongPressTimer(context, ev) {
    context.touchTimeout = setTimeout(() => {
        initiateDrag(ev, context);
    }, context.touchDurationThreshold);
}

/**
 * Cancels the long press timer.
 * @param {Object} context - The touch context.
 */
function cancelLongPressTimer(context) {
    if (context.touchTimeout) {
        clearTimeout(context.touchTimeout);
        context.touchTimeout = null;
    }
}

/**
 * Initiates dragging after a long press.
 * @param {TouchEvent} ev - The touch event.
 * @param {Object} context - The touch context.
 */
function initiateDrag(ev, context) {
    const { taskElement, offsetX, offsetY } = context;
    context.isDragging = true;
    ev.preventDefault();
    taskElement.classList.add("dragging");

    const touch = ev.touches ? ev.touches[0] : ev.changedTouches[0];
    moveAt(taskElement, touch.pageX, touch.pageY, offsetX, offsetY);
}

/**
 * Binds the touch event handlers for touchmove and touchend.
 * @param {Object} context - The touch context.
 */
function bindTouchEventHandlers(context) {
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
 * Processes touch move events during dragging.
 * @param {TouchEvent} e - The touch event.
 * @param {Object} context - The touch context.
 */
function onTouchMove(e, context) {
    if (shouldCancelLongPress(context)) {
        cancelLongPressTimer(context);
    }

    if (context.isDragging) {
        e.preventDefault();
        const touch = e.touches[0];
        moveAt(context.taskElement, touch.pageX, touch.pageY, context.offsetX, context.offsetY);
        updateDropAreaHighlightAtPoint(touch.clientX, touch.clientY, context);
    }
}

/**
 * Checks whether the long press should be canceled.
 * @param {Object} context - The touch context.
 * @returns {boolean} True if the long press should be canceled.
 */
function shouldCancelLongPress(context) {
    const timeSinceStart = Date.now() - context.touchStartTime;
    return !context.isDragging && timeSinceStart < context.touchDurationThreshold;
}

/**
 * Processes touch end events after dragging.
 * @param {TouchEvent} e - The touch event.
 * @param {Object} context - The touch context.
 */
function onTouchEnd(e, context) {
    const { taskElement, onTouchMove, onTouchEnd } = context;

    cancelLongPressTimer(context);
    document.removeEventListener('touchmove', onTouchMove);
    taskElement.removeEventListener('touchend', onTouchEnd);

    if (context.isDragging) {
        processDragEnd(e, context);
    } else {
        processTap(context);
    }

    // Reset context
    context.currentDropTarget = null;
}

/**
 * Processes the end of dragging.
 * @param {TouchEvent} e - The touch event.
 * @param {Object} context - The touch context.
 */
function processDragEnd(e, context) {
    if (context.currentDropTarget) {
        context.currentDropTarget.classList.remove('highlight');
    }
    handleDrop(e, context);
    resetTaskElementStyles(context.taskElement);
}

/**
 * Processes a simple tap (no long press).
 * @param {Object} context - The touch context.
 */
function processTap(context) {
    openCardOverlay(context.taskElement.id);
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
 * Updates the highlighting of the drop area based on the touch coordinates.
 * @param {number} x - The X coordinate of the touch point.
 * @param {number} y - The Y coordinate of the touch point.
 * @param {Object} context - The touch context.
 */
function updateDropAreaHighlightAtPoint(x, y, context) {
    // Temporarily hide the task element
    context.taskElement.style.display = 'none';
    const touchElement = document.elementFromPoint(x, y);
    context.taskElement.style.display = '';

    const dropArea = touchElement ? touchElement.closest('.drag-area') : null;
    updateDropAreaHighlight(dropArea, context);
}

/**
 * Updates the highlighting of drop areas during dragging.
 * @param {HTMLElement|null} dropArea - The current drop area.
 * @param {Object} context - The touch context.
 */
function updateDropAreaHighlight(dropArea, context) {
    if (dropArea !== context.currentDropTarget) {
        if (context.currentDropTarget) {
            context.currentDropTarget.classList.remove('highlight');
        }
        if (dropArea) {
            dropArea.classList.add('highlight');
        }
        context.currentDropTarget = dropArea;
    }
}

/**
 * Handles dropping the task into the drop area.
 * @param {TouchEvent} e - The touch event.
 * @param {Object} context - The touch context.
 */
function handleDrop(e, context) {
    const { taskElement } = context;

    // Temporarily hide the task element
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
 * Resets the styles of the task element after dragging.
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
 * Opens the card overlay for the given task element.
 * @param {string} taskId - The ID of the task.
 */
function openCardOverlay(taskId) {
    // Your implementation to open the overlay goes here
}

/**
 * Allows the drop event by preventing the default behavior.
 * @param {DragEvent} ev - The drag event.
 */
function allowDrop(ev) {
    ev.preventDefault();
}

/**
 * Processes the drop event for mouse-based dragging.
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