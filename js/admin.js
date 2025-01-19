async function fetchDataFromURL(url) {
  try {
    const response = await fetch(url); 
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json(); 
    return data;
  } catch (err) {
    console.error('Error fetching data from', url, err);
    return null;
  }
};

document.addEventListener('DOMContentLoaded', () => {
  const buttons = document.querySelectorAll('.nav-button');

  buttons.forEach(button => {
    button.addEventListener('click', () => {
      const sectionId = button.getAttribute('data-section');
      showSection(sectionId);
    });
  });

  function showSection(sectionId) {
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
      section.style.display = section.id === sectionId ? 'block' : 'none';
    });
  }

  showSection('users');
});

function showSection(sectionId) {
  const sections = document.querySelectorAll('.section');
  sections.forEach(section => {
    section.classList.remove('active');
  });

  const selectedSection = document.getElementById(sectionId);
  if (selectedSection) {
    selectedSection.classList.add('active');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  showSection('users');
});
const getElement = (selector) => document.querySelector(selector);

const renderTable = (selector, headers, rows) => {
  const table = getElement(selector);
  table.innerHTML = `
    <thead>
      <tr>${headers.map((header) => `<th>${header}</th>`).join("")}</tr>
    </thead>
    <tbody>
      ${rows.map(
        (row) =>
          `<tr>${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>`
      ).join("")}
    </tbody>
  `;
};

const searchTable = (searchInputId, tableSelector, columnIndex) => {
  const searchInput = getElement(searchInputId);
  const table = getElement(tableSelector);
  const rows = Array.from(table.querySelectorAll("tbody tr"));

  searchInput.addEventListener("input", () => {
    const query = searchInput.value.toLowerCase();
    rows.forEach((row) => {
      const cell = row.cells[columnIndex].textContent.toLowerCase();
      row.style.display = cell.includes(query) ? "" : "none";
    });
  });
};

const initAdminDashboard = async () => {
  try {
    const [adminData, usersData, productsData, ordersData] = await Promise.all([
      fetchDataFromURL('http://localhost:3000/admin'),
      fetchDataFromURL('http://localhost:3000/users'),
      fetchDataFromURL('http://localhost:3000/products'),
      fetchDataFromURL('http://localhost:3000/orders'),
    ]);

    if (adminData) {
      const adminRows = adminData.map((admin) => [
        admin.name,
        admin.email,
        admin.role,
        admin.status,
      ]);
      renderTable("#admin-table", ["Name", "Email", "Role", "Status"], adminRows);
    }

    if (usersData && productsData && ordersData) {
      const userRows = usersData.map((user) => [
        user.id,
        user.name,
        user.email,
        user.role,
        user.status || "deactivated",
        `<button onclick="editUser('${user.id}')">Edit</button>
         <button onclick="deleteUser('${user.id}')">Delete</button>`,
      ]);
      renderTable("#users-table", ["id", "Name", "Email", "Role", "Status", "Actions"], userRows);

      const productRows = productsData.map((product) => [
        product.id,
        product.name,
        product.seller,
        product.category,
        product.price,
        `<img src="${product.image}" alt="${product.name}" width="50" height="50">`, 
        product.status,
        `<button onclick="approveProduct('${product.id}')">Approve</button>
         <button onclick="rejectProduct('${product.id}')">Reject</button>`,
      ]);
      renderTable("#products-table", ["id", "Name", "Seller", "Category", "Price", "Image", "Status", "Actions"], productRows);

      const orderRows = ordersData.map((order) => [
        order.id,
        order.customer,
        order.product,
        order.status,
        order.date,
        `<button onclick="updateOrderStatus('${order.id}')">Update Status</button>`,
      ]);
      renderTable("#orders-table", ["id", "Customer", "Product", "Status", "Date", "Actions"], orderRows);

      searchTable("#search-users", "#users-table", 1); 
      searchTable("#search-products", "#products-table", 1); 
      searchTable("#search-orders", "#orders-table", 1); 
    }
  } catch (err) {
    console.error('Error initializing dashboard', err);
  }
};

const editUser = async (id) => {
  try {
    const user = await fetchDataFromURL(`http://localhost:3000/users/${id}`);
    if (!user) {
      alert(`User with ID ${id} not found.`);
      return;
    }

    getElement("#edit-user-name").value = user.name;
    getElement("#edit-user-email").value = user.email;
    getElement("#edit-user-role").value = user.role;
    getElement("#edit-user-status").value = user.status;

    const editForm = getElement("#edit-user-form");
    editForm.style.display = "block";

    getElement("#save-user-button").onclick = async () => {
      try {
        const updatedUser = {
          name: getElement("#edit-user-name").value,
          email: getElement("#edit-user-email").value,
          role: getElement("#edit-user-role").value,
          status: getElement("#edit-user-status").value,
        };

        const response = await fetch(`http://localhost:3000/users/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedUser),
        });

        if (!response.ok) throw new Error("Failed to update user.");
        alert("User updated successfully.");
        editForm.style.display = "none";
        initAdminDashboard();
      } catch (err) {
        console.error("Error updating user:", err);
      }
    };
  } catch (err) {
    console.error("Error fetching user data:", err);
  }
};

const deleteUser = async (id) => {
  try {
    const response = await fetch(`http://localhost:3000/users/${id}`, { method: "DELETE" });
    if (!response.ok) throw new Error("Failed to delete user");
    alert(`Deleted User with ID: ${id}`);
    initAdminDashboard();
  } catch (err) {
    console.error("Error deleting user", err);
  }
};

const approveProduct = async (id) => {
  try {
    const response = await fetch(`http://localhost:3000/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "Approved" }),
    });
    if (!response.ok) throw new Error("Failed to approve product");
    alert(`Approved Product with ID: ${id}`);
    initAdminDashboard();
  } catch (err) {
    console.error("Error approving product", err);
  }
};

const rejectProduct = async (id) => {
  try {
    const response = await fetch(`http://localhost:3000/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "Rejected" }),
    });
    if (!response.ok) throw new Error("Failed to reject product");
    alert(`Rejected Product with ID: ${id}`);
    initAdminDashboard();
  } catch (err) {
    console.error("Error rejecting product", err);
  }
};

const updateOrderStatus = async (id) => {
  try {
    const nextStatus = prompt("Enter new status (Pending, Shipped, Delivered):");
    if (nextStatus) {
      const response = await fetch(`http://localhost:3000/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (!response.ok) throw new Error("Failed to update order status");
      alert(`Updated Order with ID: ${id}`);
      initAdminDashboard();
    }
  } catch (err) {
    console.error("Error updating order status", err);
  }
};

window.onload = () => {
  initAdminDashboard();
};
