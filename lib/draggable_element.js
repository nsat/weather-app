// Code adapted from: https://www.w3schools.com/howto/howto_js_draggable.asp

function makeElementDraggable(elmnt) {
  var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  elmnt.onmousedown = dragMouseDown;
  elmnt.ontouchstart = dragMouseDown

  function dragMouseDown(e) {
    // strictly enforce the drag handler
    // only applying to the specified element,
    // thereby preventing a child DOM element click
    // from initiating a drag of the parent element.
    if (e.target == elmnt) {
      e = e || window.event;
      // get the mouse cursor position at startup:
      if (e.type === "touchstart") {
        pos3 = e.touches[0].clientX;
        pos4 = e.touches[0].clientY;
      } else {
        e.preventDefault();
        pos3 = e.clientX;
        pos4 = e.clientY;
      }
      document.onmouseup = closeDragElement;
      document.ontouchend = closeDragElement;
      // call a function whenever the cursor moves:
      document.onmousemove = elementDrag;
      document.ontouchmove = elementDrag;
    }
  }

  function elementDrag(e) {
    e = e || window.event;
    // calculate the new cursor position:
    if (e.type === "touchmove") {
      pos1 = pos3 - e.touches[0].clientX;
      pos2 = pos4 - e.touches[0].clientY;
      pos3 = e.touches[0].clientX;
      pos4 = e.touches[0].clientY;
    } else {
      e.preventDefault();
      pos1 = pos3 - e.clientX;
      pos2 = pos4 - e.clientY;
      pos3 = e.clientX;
      pos4 = e.clientY;
    }
    // set the element's new position:
    elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
    elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
  }

  function closeDragElement() {
    // stop moving when mouse button is released:
    document.onmouseup = null;
    document.onmousemove = null;
    document.ontouchend = null;
    document.ontouchmove = null;
  }
}