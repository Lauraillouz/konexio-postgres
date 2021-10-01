const { Pool } = require("pg");
const Postgres = new Pool({ ssl: { rejectUnauthorized: false } });

const getContacts = async (req, res) => {
  const data = req.cookies.jwtData;
  const query = req.query;
  const queryKey = Object.keys(query);

  try {
    const user = await Postgres.query(
      "SELECT * FROM users_crm WHERE users_crm.id=$1",
      [data.id]
    );
    const userId = user.rows[0].id;

    const contacts = await Postgres.query(
      "SELECT * FROM contacts_crm INNER JOIN users_contacts ON contacts_crm.id=users_contacts.contacts_crm_id INNER JOIN users_crm ON users_crm.id=users_contacts.users_crm_id WHERE users_crm.id=$1",
      [userId]
    );

    const numberOfContacts = contacts.rows.length;

    if (queryKey.length !== 0) {
      const selectedContacts = contacts.find((contact) => {
        if (queryKey[0] === "category") {
          return contact[queryKey[0]] === parseInt(query[queryKey[0]]);
        } else {
          return (
            contact[queryKey[0]].toLowerCase().replace(" ", "") ===
            query[queryKey[0]].toLowerCase().replace(" ", "")
          );
        }
      });
      if (selectedContacts) {
        return res.status(200).json({
          message: "Found something!",
          data: selectedContacts,
        });
      } else {
        return res.status(400).json({
          message: "Something went wrong. Please enter a valid contact name",
        });
      }
    }

    return res.status(200).json({
      message: "Access granted",
      data: contacts.rows,
      nb: numberOfContacts,
    });
  } catch (err) {
    res.status(404).json({
      message: err,
    });
  }
};

const newContact = async (req, res) => {
  const contactInfo = req.body;
  const data = req.cookies.jwtData;
  try {
    const contact = await Postgres.query(
      "SELECT * FROM contacts_crm WHERE email=$1",
      [contactInfo.email]
    );

    if (contact.rows.length === 0) {
      const newContact = await Postgres.query(
        "INSERT INTO contacts_crm(name, email, description, category) VALUES($1, $2, $3, $4)",
        [
          contactInfo.name,
          contactInfo.email,
          contactInfo.description,
          contactInfo.category,
        ]
      );
      const contactId = await Postgres.query(
        "SELECT * FROM contacts_crm WHERE email=$1",
        [contactInfo.email]
      );

      await Postgres.query(
        "INSERT INTO users_contacts(users_crm_id, contacts_crm_id) VALUES($1, $2)",
        [data.id, contactId.rows[0].id]
      );

      return res.status(201).json({
        message: "New contact has successfully been created",
      });
    } else {
      res.status(403).json({
        message: "This contact already exists",
      });
    }
  } catch (err) {
    return res.status(400).json({
      message: err,
    });
  }
};

const modifyContact = async (req, res) => {
  const { email } = req.body;
  const infoToChange = req.query;

  try {
    const contact = await Contact.findOne({ email });
    const contactId = contact._id;

    // Get which info to update
    const contactKeys = Object.keys(infoToChange);

    // Update info dynamically
    if (contact) {
      contactKeys.map(async (key) => {
        const updatedContact = await Contact.updateOne(
          { _id: contactId },
          { [key]: infoToChange[key] }
        );
        return updatedContact;
      });
      const freshContact = await Contact.findOne({ _id: contactId });

      // Return info to front
      return res.status(200).json({
        message: "Contact successfully updated",
        data: freshContact,
      });
    } else {
      return res.status(404).json({
        message: "Something went wrong",
      });
    }
  } catch (err) {
    res.status(404).json({
      message: err,
    });
  }
};

const deleteContact = async (req, res) => {
  const { email } = req.body;

  const contact = await Postgres.query("");

  if (contact) {
    try {
      // Find contact's user
      const user = await User.find({ _id: contact.userId });
      // Delete contact
      await Contact.deleteOne({ email });
      // Show nex list of contacts updated
      const newContacts = await Contact.find({
        userId: user[0]._id.toString(),
      });
      res.status(200).json({
        message: "Contact has been successfully deleted",
        data: newContacts,
      });
    } catch (err) {
      res.status(403).json({
        message: err,
      });
    }
  } else {
    res.status(404).json({
      message: "This contact does not exist",
    });
  }
};

module.exports = { getContacts, newContact, modifyContact, deleteContact };
