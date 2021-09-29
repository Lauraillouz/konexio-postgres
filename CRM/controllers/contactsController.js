const getContacts = async (req, res) => {
  const data = req.cookies.jwtData;
  const query = req.query;
  const queryKey = Object.keys(query);

  try {
    const user = await User.findOne({ _id: data.id });
    const userId = user._id;
    console.log(user);

    const contacts = await Contact.find({ userId });

    const numberOfContacts = contacts.length;

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
      data: contacts,
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

  const contact = await Contact.findOne({ email: contactInfo.email });

  if (!contact) {
    try {
      const newContact = await Contact.create({
        userId: data.id,
        name: contactInfo.name,
        email: contactInfo.email,
        description: contactInfo.description,
      });
      return res.status(201).json({
        message: "New contact has successfully been created",
        data: newContact,
      });
    } catch (err) {
      return res.status(400).json({
        message: err,
      });
    }
  } else {
    res.status(403).json({
      message: "This contact already exists",
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

  const contact = await Contact.findOne({ email });

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
