/**
 * @typedef {Object} Event
 * @property {string} id
 * @property {number} imageVersion
 * @property {string} title
 * @property {number} sizeTitle
 * @property {string} date
 * @property {string} hour
 * @property {string} content
 * @property {number} sizeDescription
 * @property {string} condition
 * @property {boolean} inscription
 */

/**
 * @typedef {Object} Page
 * @property {string} id
 * @property {boolean} reverse
 * @property {Event[]} events
 */

/**
 * @typedef {Object} Styles
 * @property {string} bgDate
 * @property {string} bgTitle
 * @property {string} colorDate
 * @property {string} colorTitle
 * @property {string} colorContent
 * @property {number} zoom
 * @property {boolean} autoZoom
 */

/**
 * @typedef {Object} AppDocument
 * @property {string} id
 * @property {number} version
 * @property {string} name
 * @property {number | null} libraryId
 * @property {number | null} monthId
 * @property {Page[]} pages
 * @property {Styles} styles
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/**
 * @typedef {Partial<Pick<AppDocument, 'name' | 'libraryId' | 'monthId' | 'pages' | 'styles'>>} DocumentUpdates
 */

/**
 * @typedef {Object} EventTimeSlot
 * @property {string} start
 * @property {string} end
 */

/**
 * @typedef {Object} ManagedEvent
 * @property {string} id
 * @property {string} title
 * @property {number} libraryId
 * @property {string} location
 * @property {string} condition
 * @property {string} startDate
 * @property {string | null} endDate
 * @property {EventTimeSlot[]} timeSlots
 * @property {string} description
 * @property {string} posterDescription
 * @property {string} bookletDescription
 * @property {string} onlineDescription
 * @property {boolean} inscription
 * @property {string} createdAt
 * @property {string} updatedAt
 */
