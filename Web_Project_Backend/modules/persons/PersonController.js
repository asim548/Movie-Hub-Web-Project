const Person = require('./Person');
const ALLOWED_ROLES = new Set(['Actor', 'Director']);
const ALLOWED_GENDERS = new Set(['Male', 'Female', 'Other']);

const normalizeRole = (role) => {
    if (!role) return undefined;
    const value = String(role).trim().toLowerCase();
    if (value === 'actor') return 'Actor';
    if (value === 'director') return 'Director';
    return null;
};

const normalizeGender = (gender) => {
    if (!gender) return undefined;
    const value = String(gender).trim().toLowerCase();
    if (value === 'male') return 'Male';
    if (value === 'female') return 'Female';
    if (value === 'other') return 'Other';
    return null;
};

// Create a new person
const createPerson = async (req, res) => {
    try {
        const { name, role, country, gender, age, biography, photos } = req.body;
        const normalizedRole = normalizeRole(role) || 'Actor';
        const normalizedGender = normalizeGender(gender) || 'Other';

        if (!ALLOWED_ROLES.has(normalizedRole)) {
            return res.status(400).json({ data: null, message: 'role must be Actor or Director' });
        }
        if (!ALLOWED_GENDERS.has(normalizedGender)) {
            return res.status(400).json({ data: null, message: 'gender must be Male, Female, or Other' });
        }

       
       

        // Create a new person
        const person = new Person({
            name,
            role: normalizedRole,
            country,
            gender: normalizedGender,
            age,
            biography,
            photos
        });

        await person.save();
        res.status(201).json({ data: person, message: 'Person created successfully' });
    } catch (error) {
        res.status(500).json({ data: null, message: error.message });
    }
};

// Get a person by ID
const getPersonById = async (req, res) => {
    try {
        const id = req.params.id;
        const person = await Person.findById(id);

        if (person) {
            res.status(200).json({ data: person });
        } else {
            res.status(404).json({ data: null, message: 'Person not found' });
        }
    } catch (error) {
        res.status(500).json({ data: null, message: error.message });
    }
};




// Get all persons with pagination
const getPersons = async (req, res) => {
    try {
        // Extract pagination parameters from the query string, with default values
        const page = parseInt(req.query.page) || 1; // Default to page 1 if not provided
        const limit = parseInt(req.query.limit) || 10; // Default to limit 10 if not provided
        const skip = (page - 1) * limit; // Skip the appropriate number of records

        // Fetch the total number of persons for pagination info
        const totalPersons = await Person.countDocuments();

        // Fetch the paginated persons
        const persons = await Person.find()
            .skip(skip) // Skip records based on pagination
            .limit(limit); // Limit the number of records per page

        if (persons.length === 0) {
            return res.status(404).json({ message: "No persons found" });
        }

        // Send the response with pagination information
        res.status(200).json({
            data: persons,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalPersons / limit),
                totalItems: totalPersons,
                itemsPerPage: limit,
                hasNextPage: page * limit < totalPersons,
                hasPrevPage: page > 1,
            },
        });
    } catch (error) {
        res.status(500).json({ data: null, message: error.message });
    }
};


// Update a person
const updatePerson = async (req, res) => {
    try {
        const { name, role, country, gender, age, biography, photos } = req.body;
        const normalizedRole = role !== undefined ? normalizeRole(role) : undefined;
        const normalizedGender = gender !== undefined ? normalizeGender(gender) : undefined;

        if (role !== undefined && !normalizedRole) {
            return res.status(400).json({ data: null, message: 'role must be Actor or Director' });
        }
        if (gender !== undefined && !normalizedGender) {
            return res.status(400).json({ data: null, message: 'gender must be Male, Female, or Other' });
        }

        const updatedPerson = await Person.findByIdAndUpdate(
            req.params.id,
            {
                ...(name !== undefined ? { name } : {}),
                ...(normalizedRole !== undefined ? { role: normalizedRole } : {}),
                ...(country !== undefined ? { country } : {}),
                ...(normalizedGender !== undefined ? { gender: normalizedGender } : {}),
                ...(age !== undefined ? { age } : {}),
                ...(biography !== undefined ? { biography } : {}),
                ...(photos !== undefined ? { photos } : {}),
            },
            { new: true, runValidators: true } // Return updated document and validate inputs
        );

        if (!updatedPerson) {
            return res.status(404).json({ data: null, message: 'Person not found' });
        }

        res.status(200).json({ data: updatedPerson, message: 'Person updated successfully' });
    } catch (error) {
        res.status(500).json({ data: null, message: error.message });
    }
};

// Delete a person
const deletePerson = async (req, res) => {
    try {
        const person = await Person.findByIdAndDelete(req.params.id);

        if (!person) {
            return res.status(404).json({ data: null, message: 'Person not found' });
        }

        res.status(200).json({ message: 'Person deleted successfully' });
    } catch (error) {
        res.status(500).json({ data: null, message: error.message });
    }
};

module.exports = {
    createPerson,
    getPersons,
    getPersonById,
    updatePerson,
    deletePerson,
};
