const IMAGE_CLASS = "evasive"
const IMAGE_WRAPPER_CLASS = "evasive-wrapper"

document.addEventListener("DOMContentLoaded", () => {
  const wrappers = document.getElementsByClassName(IMAGE_WRAPPER_CLASS)
  const images = document.getElementsByClassName(IMAGE_CLASS)
  if (!wrappers.length || !images.length) {
    console.warn("No images found.")
    return
  }

  // Iterate in reverse to avoid shifting layout while
  // changing elements' positions
  for (let i = wrappers.length; i >= 0; i--) {
    const wrapper = wrappers.item(i)
    if (wrapper) {
      // Position absolutely with current location so that
      // updating the elements' positions later won't shift
      // the layout for other elements that have not been
      // positioned absolutely
      positionElementAbsolute(wrapper)
      // Add "mouseover" evasion listener to each image
      evadeTheMouse(wrapper)
    }
  }
})

/**
 * @param {HTMLDivElement} element
 */
function positionElementAbsolute(element) {
  const { top, left } = element.getBoundingClientRect()
  element.style.setProperty("top", `${top}px`)
  element.style.setProperty("left", `${left}px`)
  element.style.setProperty("position", "absolute")
}

/**
 * @param {HTMLDivElement} element
 */
function evadeTheMouse(element) {
  if (!element) {
    return
  }
  
  element.addEventListener("mousemove", (e) => {
    // Get the location of the element and the mouse
    const { clientX: mouseX, clientY: mouseY } = e
    const { top, left, right, bottom, height, width } = element.getBoundingClientRect()

    // Exit early if the mouse isn't overlapping
    const mouseIsIntersecting = mouseX >= left && mouseX <= right && mouseY >= top && mouseY <= bottom
    if (!mouseIsIntersecting) {
      return
    }

    // Create vectors for each coordinate to more easily do math operations
    const mouseV = new Vector(mouseX, mouseY)
    const centerV = new Vector(left + width / 2, top + height / 2)
    // Calculate where the line from the center to mouse will extend
    // into the edge of the image
    const targetV = getIntersectingPoint({ top, left, right, bottom, height, width }, centerV, mouseV)
    // Calculate how far the mouse is from the edge of the image
    // (where it should be)
    const deltaV = mouseV.subtract(targetV)
    // Move the corner of the image the same amount
    const newTopLeftV = new Vector(left, top).add(deltaV)

    // TODO: Make these not get stuck in the corner!
    if (newTopLeftV.x < 0) {
      newTopLeftV.x = 0;
    }
    if (newTopLeftV.y < 0) {
      newTopLeftV.y = 0;
    }

    // Set the new element's position
    element.style.setProperty("position", "absolute")
    element.style.setProperty("top", `${newTopLeftV.y}px`)
    element.style.setProperty("left", `${newTopLeftV.x}px`)
  })
}

// A simple vector implementation
class Vector {
  constructor(x, y) {
    this.x = x
    this.y = y
  }

  add(v2) {
    return new Vector(this.x + v2.x, this.y + v2.y)
  }

  subtract(v2) {
    return new Vector(this.x - v2.x, this.y - v2.y)
  }

  multiply(factor) {
    return new Vector(this.x * factor, this.y * factor)
  }

  divide(factor) {
    return new Vector(this.x / factor, this.y / factor)
  }

  length() {
    return Math.sqrt(this.x * this.x + this.y * this.y)
  }

  normalize() {
    return this.divide(this.length())
  }
}

function createDebugShape(top, left, height, width, color = "red", radius) {
  const div = document.createElement("div")
  div.style.setProperty("background-color", color)
  div.style.setProperty("position", "absolute")
  div.style.setProperty("top", `${top}px`)
  div.style.setProperty("left", `${left}px`)
  div.style.setProperty("height", `${height}px`)
  div.style.setProperty("width", `${width}px`)
  if (radius) {
    div.style.setProperty("border-radius", radius)
    div.style.setProperty("border", "1px solid black")
  }
  document.body.appendChild(div)
}

function getIntersectingPoint(element, center, mouse) {
  const edges = findNearestEdges(element, center, mouse)

  // Calculate the intersecting point for the two closest edges.
  // One edge will have an intersecting point on the edge of the element.
  for (let i = 0; i < edges.length; i++) {
    const { intersection } = edges[i]
    const slope = getSlope(center, mouse)
    // createDebugShape(center.y, center.x, 5, 5, "blue", 2)
    const { solveForX, solveForY } = getEquations(slope, mouse)
    if (intersection.x === undefined) {
      const { y } = intersection
      const x = solveForX(y)
      if (x <= element.right && x >= element.left) {
        // createDebugShape(y, x, 3, 3, "green", 2)
        return new Vector(x, y)
      }
    } else if (intersection.y === undefined) {
      const { x } = intersection
      const y = solveForY(x)
      if (y <= element.bottom && y >= element.top) {
        // createDebugShape(y, x, 3, 3, "yellow", 2)
        return new Vector(x, y)
      }
    } else {
      throw new Error("Unable to find intersecting point")
    }
  }
}

function findNearestEdges(element, center, mouse) {
  const edges = []
  const lines = getEdges(element)
  if (mouse.x <= center.x) {
    // Mouse is on the left
    edges.push({ edge: lines[3], intersection: { x: element.left, y: undefined } })
  } else {
    // Mouse is on the right
    edges.push({ edge: lines[1], intersection: { x: element.right, y: undefined } })
  }
  
  if (mouse.y <= center.y) {
    // Mouse is on the top
    edges.push({ edge: lines[0], intersection: { x: undefined, y: element.top } })
  } else {
    // Mouse is on the bottom
    edges.push({ edge: lines[2], intersection: { x: undefined, y: element.bottom } })
  }

  return edges
}

function getEdges({ left, right, bottom, top }) {
  return [
    [{ x: left, y: top }, { x: right, y: top }], // top
    [{ x: right, y: top }, { x: right, y: bottom }], // right
    [{ x: right, y: bottom }, { x: left, y: bottom }], // bottom
    [{ x: left, y: bottom }, { x: left, y: top }], // left
  ]
}

function getSlope(point1, point2) {
	return (point2.y - point1.y) / (point2.x - point1.x)
}

function getEquations(slope, point) {
	function solveForY(x) {
  	return slope * x - slope * point.x + point.y
  }

  function solveForX(y) {
  	return (y - point.y + slope * point.x) / slope
  }
  
  return { solveForX, solveForY }
}
