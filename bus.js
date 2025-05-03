// DOM Elements
const sidebarToggle = document.getElementById('toggle-sidebar');
const dashboard = document.querySelector('.dashboard-container');
const menuItems = document.querySelectorAll('.menu-item');
const pages = document.querySelectorAll('.page');
const userProfile = document.querySelector('.user-profile');
const dropdownMenu = document.querySelector('.dropdown-menu');
const routePlanningForm = document.getElementById('route-planning-form');
const routeSearchInput = document.getElementById('route-search');
const currentLocationBtn = document.getElementById('current-location');
const searchResults = document.getElementById('search-results');
const closeRoutePlanning = document.getElementById('close-route-planning');
const addRouteBtn = document.getElementById('add-route-btn');
const routeModal = document.getElementById('route-modal');
const closeRouteModal = document.getElementById('close-route-modal');
const cancelRoute = document.getElementById('cancel-route');
const saveRouteBtn = document.getElementById('save-route');
const journeyForm = document.getElementById('journey-form');
const loadingSpinner = document.getElementById('loading-spinner');
const tabButtons = document.querySelectorAll('.tab-btn');
const chartPeriodButtons = document.querySelectorAll('[data-chart-period]');
const selectAllCheckboxes = document.querySelectorAll('.select-all');
const routeModalTitle = document.getElementById('route-modal-title');
const addBookingBtn = document.getElementById('add-booking-btn');
const bookingModal = document.getElementById('booking-modal');

const cancelBooking = document.getElementById('cancel-booking');
const saveBookingBtn = document.getElementById('save-booking');
const bookingModalTitle = document.getElementById('booking-modal-title');

// Initialize the dashboard
document.addEventListener('DOMContentLoaded', function() {
  // Initialize Charts
  initializeCharts();
  
  // Handle auto-hiding loading spinner
  setTimeout(() => {
    hideLoadingSpinner();
  }, 800);
});

// Toggle sidebar
sidebarToggle.addEventListener('click', function() {
  dashboard.classList.toggle('sidebar-collapsed');
  
  // Store the sidebar state in local storage
  const isCollapsed = dashboard.classList.contains('sidebar-collapsed');
  localStorage.setItem('sidebar-collapsed', isCollapsed);
  
  // Trigger resize event to update charts
  window.dispatchEvent(new Event('resize'));
});

// Load sidebar state from local storage
if (localStorage.getItem('sidebar-collapsed') === 'true') {
  dashboard.classList.add('sidebar-collapsed');
}

// Navigation menu
menuItems.forEach(item => {
  item.addEventListener('click', function(e) {
    e.preventDefault();
    
    // Show loading spinner
    showLoadingSpinner();
    
    const targetPageId = this.dataset.page;
    
    // Simulate a small delay for loading
    setTimeout(() => {
      // Remove active class from all menu items
      menuItems.forEach(menuItem => {
        menuItem.classList.remove('active');
      });
      
      // Add active class to clicked menu item
      this.classList.add('active');
      
      // Hide all pages
      pages.forEach(page => {
        page.classList.remove('active');
      });
      
      // Show the target page
      document.getElementById(targetPageId).classList.add('active');
      
      // Hide loading spinner
      hideLoadingSpinner();
      
      // Update page title
      document.title = `${this.querySelector('span').textContent} | EasyCommute Admin`;
    }, 300);
  });
});

// User profile dropdown
userProfile.addEventListener('click', function(e) {
  e.stopPropagation();
  dropdownMenu.classList.toggle('show');
});

// Close dropdown when clicking outside
document.addEventListener('click', function(e) {
  if (dropdownMenu.classList.contains('show') && !userProfile.contains(e.target)) {
    dropdownMenu.classList.remove('show');
  }
});

// Route search input
routeSearchInput.addEventListener('click', function() {
  routePlanningForm.classList.add('active');
  searchResults.classList.add('active');
  showToast('Route Planner', 'Enter your source and destination to find buses.', 'info');
});

// Current location button
currentLocationBtn.addEventListener('click', function() {
  showLoadingSpinner();
  
  // Check if geolocation is supported
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        hideLoadingSpinner();
        
        // In a real application, you would use these coordinates to fetch location name
        // For now, just show a toast notification
        showToast('Location Found', `Latitude: ${position.coords.latitude}, Longitude: ${position.coords.longitude}`, 'success');
        
        // Show route planning form
        routePlanningForm.classList.add('active');
        
        // In a real app, you would populate the source location input
        // For demo, let's set it to a fixed value
        document.getElementById('source').value = 'Current Location';
      },
      (error) => {
        hideLoadingSpinner();
        showToast('Location Error', 'Unable to access your location. Please allow location access.', 'error');
        console.error('Geolocation error:', error);
      }
    );
  } else {
    hideLoadingSpinner();
    showToast('Not Supported', 'Geolocation is not supported by your browser.', 'error');
  }
});

// Close route planning form
closeRoutePlanning.addEventListener('click', function() {
  routePlanningForm.classList.remove('active');
  searchResults.classList.remove('active');
});

// Journey form submit
journeyForm.addEventListener('submit', function(e) {
  e.preventDefault();
  
  const source = document.getElementById('source').value;
  const destination = document.getElementById('destination').value;
  const date = document.getElementById('travel-date').value;
  const passengers = document.getElementById('passengers').value;
  
  // Validate form
  if (!source || !destination || !date || !passengers) {
    showToast('Validation Error', 'Please fill all the required fields.', 'error');
    return;
  }
  
  // Show loading spinner
  showLoadingSpinner();
  
  // Simulate API call delay
  setTimeout(() => {
    hideLoadingSpinner();
    
    // Update route info
    const routeInfo = document.querySelector('.route-info p strong');
    routeInfo.textContent = `${source} → ${destination}`;
    
    // Show search results with animation
    searchResults.classList.add('active');
    
    // Show success message
    showToast('Routes Found', `Showing available buses from ${source} to ${destination} on ${formatDate(new Date(date))}.`, 'success');
  }, 1500);
});

// Add Route Button
addRouteBtn.addEventListener('click', function() {
  routeModalTitle.textContent = 'Add New Route';
  document.getElementById('route-form').reset();
  routeModal.classList.add('active');
  
  // Add animation to modal
  setTimeout(() => {
    routeModal.querySelector('.modal-content').classList.add('active');
  }, 50);
});

// Close Route Modal
function closeModal() {
  routeModal.querySelector('.modal-content').classList.remove('active');
  
  setTimeout(() => {
    routeModal.classList.remove('active');
  }, 200);
}

// Close modal events
closeRouteModal.addEventListener('click', closeModal);
cancelRoute.addEventListener('click', closeModal);

// Save Route
saveRouteBtn.addEventListener('click', async function() {
    // Get form values
    const source = document.getElementById('route-source').value;
    const destination = document.getElementById('route-destination').value;
    const distance = parseInt(document.getElementById('route-distance').value);
    const hours = parseInt(document.getElementById('route-duration-hours').value);
    const minutes = parseInt(document.getElementById('route-duration-minutes').value);
    const minFare = parseFloat(document.getElementById('route-min-fare').value);
    const maxFare = parseFloat(document.getElementById('route-max-fare').value);
    const status = document.getElementById('route-status').value;
    const description = document.getElementById('route-description').value;

    // Validate form
    if (!source || !destination || !distance || !hours || !minutes || !minFare || !maxFare) {
        showToast('Validation Error', 'Please fill all the required fields.', 'error');
        return;
    }

    // Show loading spinner
    showLoadingSpinner();

    try {
        const response = await fetch('/api/routes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                source,
                destination,
                distance,
                duration_hours: hours,
                duration_minutes: minutes,
                min_fare: minFare,
                max_fare: maxFare,
                status,
                description
            })
        });

        const result = await response.json();

        if (result.success) {
            // Close modal
            closeModal();
            
            // Add the new route to the table
            const routesTable = document.querySelector('.routes-table tbody');
            const newRow = document.createElement('tr');
            newRow.innerHTML = `
                <td><input type="checkbox" class="select-row"></td>
                <td>#${result.route_id}</td>
                <td>${source}</td>
                <td>${destination}</td>
                <td>${distance} km</td>
                <td>${hours}h ${minutes}m</td>
                <td>0</td>
                <td>₹${minFare}-${maxFare}</td>
                <td><span class="status-badge ${status}">${status}</span></td>
                <td class="actions-cell">
                    <button class="action-btn view-btn" title="View Details"><i class="fas fa-eye"></i></button>
                    <button class="action-btn edit-btn" title="Edit Route"><i class="fas fa-edit"></i></button>
                    <button class="action-btn delete-btn" title="Delete Route"><i class="fas fa-trash"></i></button>
                </td>
            `;
            routesTable.insertBefore(newRow, routesTable.firstChild);

            showToast('Success', 'Route added successfully!', 'success');
        } else {
            showToast('Error', result.message, 'error');
        }
    } catch (error) {
        console.error('Error saving route:', error);
        showToast('Error', 'Failed to save route. Please try again.', 'error');
    } finally {
        hideLoadingSpinner();
    }
});

// Add Booking Button Click Handler
addBookingBtn.addEventListener('click', function() {
    bookingModalTitle.textContent = 'New Booking';
    document.getElementById('booking-form').reset();
    populateRouteSelect(); // We'll implement this function
    bookingModal.classList.add('active');
    
    setTimeout(() => {
        bookingModal.querySelector('.modal-content').classList.add('active');
    }, 50);
});

// Close Booking Modal
function closeBookingModal() {
    bookingModal.querySelector('.modal-content').classList.remove('active');
    setTimeout(() => {
        bookingModal.classList.remove('active');
    }, 200);
}

// Close modal events
closeBookingModal.addEventListener('click', closeBookingModal);
cancelBooking.addEventListener('click', closeBookingModal);

// Populate Route Select
async function populateRouteSelect() {
    const routeSelect = document.getElementById('booking-route');
    routeSelect.innerHTML = '<option value="">Select Route</option>';
    
    try {
        const response = await fetch('/api/routes');
        const data = await response.json();
        
        if (data.success) {
            data.routes.forEach(route => {
                const option = document.createElement('option');
                option.value = route.id;
                option.textContent = `${route.source} → ${route.destination}`;
                routeSelect.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error fetching routes:', error);
        showToast('Error', 'Failed to load routes', 'error');
    }
}

// Save Booking
saveBookingBtn.addEventListener('click', async function() {
    // Get form values
    const routeId = document.getElementById('booking-route').value;
    const passengerName = document.getElementById('passenger-name').value;
    const passengerEmail = document.getElementById('passenger-email').value;
    const passengerPhone = document.getElementById('passenger-phone').value;
    const travelDate = document.getElementById('travel-date').value;
    const numPassengers = parseInt(document.getElementById('num-passengers').value);

    // Validate form
    if (!routeId || !passengerName || !passengerEmail || !passengerPhone || !travelDate || !numPassengers) {
        showToast('Validation Error', 'Please fill all the required fields.', 'error');
        return;
    }

    // Show loading spinner
    showLoadingSpinner();

    try {
        const response = await fetch('/api/bookings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                route_id: routeId,
                passenger_name: passengerName,
                passenger_email: passengerEmail,
                passenger_phone: passengerPhone,
                travel_date: travelDate,
                num_passengers: numPassengers
            })
        });

        const result = await response.json();

        if (result.success) {
            // Close modal
            closeBookingModal();
            
            // Add the new booking to the table
            const bookingsTable = document.querySelector('.bookings-table tbody');
            const newRow = document.createElement('tr');
            newRow.innerHTML = `
                <td><input type="checkbox" class="select-row"></td>
                <td>#${result.booking_id}</td>
                <td>${passengerName}</td>
                <td>${document.getElementById('booking-route').options[document.getElementById('booking-route').selectedIndex].text}</td>
                <td>${travelDate}</td>
                <td>${numPassengers}</td>
                <td>₹${result.total_fare}</td>
                <td><span class="status-badge pending">Pending</span></td>
                <td class="actions-cell">
                    <button class="action-btn view-btn" title="View Details"><i class="fas fa-eye"></i></button>
                    <button class="action-btn edit-btn" title="Edit Booking"><i class="fas fa-edit"></i></button>
                    <button class="action-btn delete-btn" title="Cancel Booking"><i class="fas fa-times"></i></button>
                </td>
            `;
            bookingsTable.insertBefore(newRow, bookingsTable.firstChild);

            showToast('Success', 'Booking created successfully!', 'success');
        } else {
            showToast('Error', result.message || 'Failed to create booking', 'error');
        }
    } catch (error) {
        console.error('Error creating booking:', error);
        showToast('Error', 'Failed to create booking. Please try again.', 'error');
    } finally {
        hideLoadingSpinner();
    }
});

// Tab navigation
tabButtons.forEach(button => {
  button.addEventListener('click', function() {
    const tabName = this.getAttribute('data-tab');
    const tabContentId = `${tabName}-tab`;
    
    // Remove active class from all tab buttons
    tabButtons.forEach(btn => {
      btn.classList.remove('active');
    });
    
    // Add active class to clicked button
    this.classList.add('active');
    
    // Hide all tab content
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(content => {
      content.classList.remove('active');
    });
    
    // Show the target tab content
    document.getElementById(tabContentId).classList.add('active');
  });
});

// Chart period buttons
chartPeriodButtons.forEach(button => {
  button.addEventListener('click', function() {
    const period = this.getAttribute('data-chart-period');
    
    // Remove active class from all buttons
    chartPeriodButtons.forEach(btn => {
      btn.classList.remove('active');
    });
    
    // Add active class to clicked button
    this.classList.add('active');
    
    // Update chart data based on period
    updateChartData(period);
  });
});

// Select all checkboxes
selectAllCheckboxes.forEach(checkbox => {
  checkbox.addEventListener('change', function() {
    const table = this.closest('table');
    const rowCheckboxes = table.querySelectorAll('.select-row');
    
    rowCheckboxes.forEach(rowCheckbox => {
      rowCheckbox.checked = this.checked;
    });
  });
});

// Show loading spinner
function showLoadingSpinner() {
  loadingSpinner.classList.add('show');
}

// Hide loading spinner
function hideLoadingSpinner() {
  loadingSpinner.classList.remove('show');
}

// Initialize Charts
function initializeCharts() {
  // Revenue Chart
  const revenueChartCtx = document.getElementById('revenueChart').getContext('2d');
  const revenueChart = new Chart(revenueChartCtx, {
    type: 'line',
    data: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [{
        label: 'Revenue',
        data: [12500, 19200, 15000, 18000, 21000, 25000, 28000],
        borderColor: '#1a73e8',
        backgroundColor: 'rgba(26, 115, 232, 0.1)',
        borderWidth: 2,
        tension: 0.4,
        fill: true
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return `Revenue: ₹${context.raw.toLocaleString()}`;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              return '₹' + value.toLocaleString();
            }
          }
        }
      }
    }
  });
  
  // Routes Chart
  const routesChartCtx = document.getElementById('routesChart').getContext('2d');
  const routesChart = new Chart(routesChartCtx, {
    type: 'pie',
    data: {
      labels: ['Mumbai-Pune', 'Delhi-Jaipur', 'Bangalore-Chennai', 'Kolkata-Patna', 'Hyderabad-Vijayawada'],
      datasets: [{
        data: [25, 20, 18, 15, 12],
        backgroundColor: [
          '#1a73e8',
          '#34a853',
          '#fbbc04',
          '#ea4335',
          '#673ab7'
        ],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom'
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const value = context.raw;
              const total = context.chart._metasets[context.datasetIndex].total;
              const percentage = Math.round((value / total) * 100);
              return `${context.label}: ${percentage}% (₹${(value * 10000).toLocaleString()})`;
            }
          }
        }
      }
    }
  });
  
  // Initialize Report Charts if on the reports page
  if (document.getElementById('revenueReportChart')) {
    initializeReportCharts();
  }
}

// Initialize Report Charts
function initializeReportCharts() {
  // Revenue Report Chart
  const revenueReportChartCtx = document.getElementById('revenueReportChart').getContext('2d');
  const revenueReportChart = new Chart(revenueReportChartCtx, {
    type: 'bar',
    data: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      datasets: [{
        label: 'Revenue',
        data: [65000, 72000, 84000, 90000, 95000, 102000, 110000, 105000, 98000, 92000, 88000, 96000],
        backgroundColor: '#1a73e8'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return `Revenue: ₹${context.raw.toLocaleString()}`;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              return '₹' + value.toLocaleString();
            }
          }
        }
      }
    }
  });
  
  // Top Routes Chart
  const topRoutesChartCtx = document.getElementById('topRoutesChart').getContext('2d');
  const topRoutesChart = new Chart(topRoutesChartCtx, {
    type: 'bar',
    data: {
      labels: ['Mumbai-Pune', 'Delhi-Jaipur', 'Bangalore-Chennai', 'Kolkata-Patna', 'Hyderabad-Vijayawada'],
      datasets: [{
        label: 'Revenue',
        data: [250000, 200000, 180000, 150000, 120000],
        backgroundColor: '#34a853'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return `Revenue: ₹${context.raw.toLocaleString()}`;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              return '₹' + value.toLocaleString();
            }
          }
        }
      }
    }
  });
  
  // Booking Distribution Chart
  const bookingDistributionChartCtx = document.getElementById('bookingDistributionChart').getContext('2d');
  const bookingDistributionChart = new Chart(bookingDistributionChartCtx, {
    type: 'doughnut',
    data: {
      labels: ['Mobile App', 'Website', 'Agent', 'Kiosk'],
      datasets: [{
        data: [45, 30, 15, 10],
        backgroundColor: [
          '#1a73e8',
          '#34a853',
          '#fbbc04',
          '#ea4335'
        ],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom'
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const value = context.raw;
              const total = context.chart._metasets[context.datasetIndex].total;
              const percentage = Math.round((value / total) * 100);
              return `${context.label}: ${percentage}%`;
            }
          }
        }
      }
    }
  });
  
  // Bus Type Performance Chart
  const busTypePerformanceChartCtx = document.getElementById('busTypePerformanceChart').getContext('2d');
  const busTypePerformanceChart = new Chart(busTypePerformanceChartCtx, {
    type: 'radar',
    data: {
      labels: ['Revenue', 'Occupancy', 'Bookings', 'Customer Rating', 'Profit Margin'],
      datasets: [
        {
          label: 'AC Sleeper',
          data: [90, 75, 70, 85, 95],
          borderColor: '#1a73e8',
          backgroundColor: 'rgba(26, 115, 232, 0.2)'
        },
        {
          label: 'Non-AC Seater',
          data: [65, 90, 85, 70, 75],
          borderColor: '#34a853',
          backgroundColor: 'rgba(52, 168, 83, 0.2)'
        },
        {
          label: 'AC Semi-Sleeper',
          data: [80, 85, 75, 80, 85],
          borderColor: '#fbbc04',
          backgroundColor: 'rgba(251, 188, 4, 0.2)'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        r: {
          min: 0,
          max: 100,
          ticks: {
            stepSize: 20
          }
        }
      }
    }
  });
  
  // Occupancy Rates Chart
  const occupancyRatesChartCtx = document.getElementById('occupancyRatesChart').getContext('2d');
  const occupancyRatesChart = new Chart(occupancyRatesChartCtx, {
    type: 'line',
    data: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      datasets: [{
        label: 'Occupancy Rate',
        data: [65, 68, 70, 72, 74, 78, 82, 80, 76, 74, 70, 72],
        borderColor: '#673ab7',
        backgroundColor: 'rgba(103, 58, 183, 0.1)',
        borderWidth: 2,
        tension: 0.4,
        fill: true
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        tooltip: {
          callbacks: {
            label: function(context) {
              return `Occupancy Rate: ${context.raw}%`;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: false,
          min: 60,
          max: 100,
          ticks: {
            callback: function(value) {
              return value + '%';
            }
          }
        }
      }
    }
  });
}

// Update Chart Data based on selected period
function updateChartData(period) {
  // In a real application, you would fetch data based on the period
  // For this demo, we'll just simulate different data for each period
  
  const revenueChart = Chart.getChart('revenueChart');
  
  if (!revenueChart) return;
  
  let labels, data;
  
  switch (period) {
    case 'weekly':
      labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      data = [12500, 19200, 15000, 18000, 21000, 25000, 28000];
      break;
    case 'monthly':
      labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
      data = [75000, 85000, 92000, 98000];
      break;
    case 'yearly':
      labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      data = [650000, 720000, 840000, 900000, 950000, 1020000, 1100000, 1050000, 980000, 920000, 880000, 960000];
      break;
  }
  
  revenueChart.data.labels = labels;
  revenueChart.data.datasets[0].data = data;
  revenueChart.update();
  
  showToast('Chart Updated', `Showing ${period} revenue data.`, 'info');
}

// Show Toast Notification
function showToast(title, message, type = 'info') {
  const toastContainer = document.getElementById('toast-container');
  
  // Create toast element
  const toastElement = document.createElement('div');
  toastElement.className = `toast ${type}`;
  
  // Set icon based on type
  let icon;
  switch (type) {
    case 'success':
      icon = 'fa-check-circle';
      break;
    case 'warning':
      icon = 'fa-exclamation-triangle';
      break;
    case 'error':
      icon = 'fa-times-circle';
      break;
    default:
      icon = 'fa-info-circle';
  }
  
  // Set toast content
  toastElement.innerHTML = `
    <div class="toast-icon">
      <i class="fas ${icon}"></i>
    </div>
    <div class="toast-content">
      <p class="toast-title">${title}</p>
      <p class="toast-message">${message}</p>
    </div>
    <button class="toast-close">
      <i class="fas fa-times"></i>
    </button>
  `;
  
  // Add toast to container
  toastContainer.appendChild(toastElement);
  
  // Show toast with animation
  setTimeout(() => {
    toastElement.classList.add('show');
  }, 10);
  
  // Close toast when close button is clicked
  const closeButton = toastElement.querySelector('.toast-close');
  closeButton.addEventListener('click', () => {
    closeToast(toastElement);
  });
  
  // Auto close after 5 seconds
  setTimeout(() => {
    closeToast(toastElement);
  }, 5000);
}

// Close Toast
function closeToast(toastElement) {
  toastElement.classList.remove('show');
  
  // Remove from DOM after animation
  setTimeout(() => {
    toastElement.remove();
  }, 300);
}

// Format Date
function formatDate(date) {
  const options = { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' };
  return date.toLocaleDateString('en-IN', options);
}

// Action Buttons Event Listeners
document.addEventListener('click', function(e) {
  // View Details Button
  if (e.target.closest('.view-btn')) {
    const row = e.target.closest('tr');
    const id = row.cells[1].textContent;
    showToast('View Details', `Viewing details for ${id}`, 'info');
  }
  
  // Edit Button
  if (e.target.closest('.edit-btn')) {
    const row = e.target.closest('tr');
    const id = row.cells[1].textContent;
    
    // If editing a route, show the route modal
    if (row.closest('.routes-table')) {
      routeModalTitle.textContent = 'Edit Route';
      
      // In a real application, you would fetch the route details
      // For this demo, we'll just populate with the table data
      document.getElementById('route-source').value = row.cells[2].textContent;
      document.getElementById('route-destination').value = row.cells[3].textContent;
      
      // Parse distance (remove " km")
      const distance = row.cells[4].textContent.replace(' km', '');
      document.getElementById('route-distance').value = distance;
      
      // Parse duration (e.g., "3h 30m")
      const durationText = row.cells[5].textContent;
      const durationMatch = durationText.match(/(\d+)h\s+(\d+)m/);
      if (durationMatch) {
        document.getElementById('route-duration-hours').value = durationMatch[1];
        document.getElementById('route-duration-minutes').value = durationMatch[2];
      }
      
      // Parse fare range (e.g., "₹450-750")
      const fareText = row.cells[7].textContent;
      const fareMatch = fareText.match(/₹(\d+)-(\d+)/);
      if (fareMatch) {
        document.getElementById('route-min-fare').value = fareMatch[1];
        document.getElementById('route-max-fare').value = fareMatch[2];
      }
      
      // Set status
      const statusText = row.cells[8].querySelector('.status-badge').textContent.toLowerCase();
      document.getElementById('route-status').value = statusText;
      
      // Show modal
      routeModal.classList.add('active');
      
      // Add animation to modal
      setTimeout(() => {
        routeModal.querySelector('.modal-content').classList.add('active');
      }, 50);
    } else {
      showToast('Edit', `Editing ${id}`, 'info');
    }
  }
  
  // Delete/Cancel Button
  if (e.target.closest('.delete-btn')) {
    const row = e.target.closest('tr');
    const id = row.cells[1].textContent;
    
    if (confirm(`Are you sure you want to delete/cancel ${id}?`)) {
      showToast('Deleted', `${id} has been deleted/cancelled.`, 'warning');
      
      // In a real application, you would send a delete request to the server
      // For this demo, we'll just fade out and remove the row
      row.style.opacity = '0.5';
      setTimeout(() => {
        row.remove();
      }, 500);
    }
  }
  
  // Activate Button
  if (e.target.closest('.active-btn')) {
    const row = e.target.closest('tr');
    const id = row.cells[1].textContent;
    
    showToast('Activated', `${id} has been activated.`, 'success');
    
    // In a real application, you would send an activation request to the server
    // For this demo, we'll just update the status badge
    const statusBadge = row.querySelector('.status-badge');
    statusBadge.className = 'status-badge confirmed';
    statusBadge.textContent = 'Active';
    
    // Replace the activate button with a delete/suspend button
    const actionCell = row.querySelector('.actions-cell');
    const activateBtn = actionCell.querySelector('.active-btn');
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'action-btn delete-btn';
    deleteBtn.title = 'Delete/Suspend';
    deleteBtn.innerHTML = '<i class="fas fa-ban"></i>';
    actionCell.replaceChild(deleteBtn, activateBtn);
  }
});

// Apply ARIA attributes for accessibility
function applyAccessibility() {
  // Add ARIA roles to navigation
  document.querySelector('.sidebar-menu').setAttribute('role', 'navigation');
  document.querySelector('.sidebar-menu').setAttribute('aria-label', 'Main Navigation');
  
  // Add ARIA labels to form inputs
  const inputs = document.querySelectorAll('input, select, textarea');
  inputs.forEach(input => {
    const label = input.previousElementSibling;
    if (label && label.tagName === 'LABEL') {
      input.setAttribute('aria-labelledby', label.id || `label-${Math.random().toString(36).substring(2, 9)}`);
    }
  });
  
  // Add ARIA labels to buttons without text
  const iconButtons = document.querySelectorAll('button:not(:empty)');
  iconButtons.forEach(button => {
    if (!button.textContent.trim() && !button.getAttribute('aria-label')) {
      button.setAttribute('aria-label', button.title || 'Button');
    }
  });
}

// Call accessibility function
applyAccessibility();

// Event delegation for row selection
document.addEventListener('change', function(e) {
  if (e.target.classList.contains('select-row')) {
    const table = e.target.closest('table');
    const allChecked = Array.from(table.querySelectorAll('.select-row')).every(checkbox => checkbox.checked);
    const someChecked = Array.from(table.querySelectorAll('.select-row')).some(checkbox => checkbox.checked);
    
    const selectAllCheckbox = table.querySelector('.select-all');
    selectAllCheckbox.checked = allChecked;
    selectAllCheckbox.indeterminate = someChecked && !allChecked;
  }
});

// Form validation
document.addEventListener('submit', function(e) {
  if (e.target.id === 'general-settings-form' || e.target.id === 'payment-settings-form') {
    e.preventDefault();
    showToast('Settings Saved', 'Your settings have been saved successfully.', 'success');
  }
});
