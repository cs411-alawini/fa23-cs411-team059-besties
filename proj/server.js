var express = require('express');
var bodyParser = require('body-parser');
var mysql = require('mysql2');
var path = require('path');
var connection = mysql.createConnection({
                host: '104.197.66.6',
                user: 'root',
                password: '12345',
                database: 'test'
});

connection.connect;


var app = express();

// set up ejs view engine 
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
 
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(__dirname + '../public'));

/* GET home page, respond by rendering index.ejs */
app.get('/', function(req, res) {
  res.render('index', { title: 'Recruitment Dashboard' });
});

app.route('/update-data.html')
    .get(function (req, res) {
        // Render the update-data.html page for GET requests
        res.render('update-data');
    })
    .post(function (req, res) {
        const { studentId, gender, schoolId, tenthBoardId, twelfthBoardId, twelfthSpecId, undergradFieldId, mbaspecId } = req.body;

        // Validate that studentId is provided
        if (!studentId) {
            res.status(400).send('Please enter a student ID.');
            return;
        }

        // Update data in the Students table
        const updateSql = `
            UPDATE Students
            SET gender = ?, schoolId = ?, tenthBoardId = ?, twelfthBoardId = ?,
                twelfthSpecId = ?, undergradFieldId = ?, MBASpecId = ?
            WHERE studentId = ?`;

        connection.query(
            updateSql,
            [gender, schoolId, tenthBoardId, twelfthBoardId, twelfthSpecId, undergradFieldId, mbaspecId, studentId],
            function (err, result) {
                if (err) {
                    res.status(500).send('Error updating data.');
                    return;
                }

                res.send('Data updated successfully.');
            }
        );
    });

// Insert data route
app.post('/insert-data', function (req, res) {
    const { studentId, gender, schoolId, tenthBoardId, twelfthBoardId, twelfthSpecId, undergradFieldId, mbaspecId } = req.body;

    // Validate that studentId is provided
    if (!studentId) {
        res.status(400).send('Please enter a student ID.');
        return;
    }
// Insert data into the Students table
    const insertSql = `
        INSERT INTO Students (studentId, gender, schoolId, tenthBoardId, twelfthBoardId, twelfthSpecId, undergradFieldId, MBASpecId)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

    connection.query(
        insertSql,
        [studentId, gender, schoolId, tenthBoardId, twelfthBoardId, twelfthSpecId, undergradFieldId, mbaspecId],
        function (err, result) {
            if (err) {
                res.status(500).send('Error inserting data.');
                return;
            }

            res.send('Data inserted successfully.');
        }
    );
});

// Delete data route
app.post('/delete-data', function (req, res) {
    const studentId = req.body.studentId;

    // Validate that studentId is provided
    if (!studentId) {
        res.status(400).send('Please enter a student ID.');
        return;
    }

    // Delete data from the Students table
    const deleteSql = 'DELETE FROM Students WHERE studentId = ?';

    connection.query(deleteSql, [studentId], function (err, result) {
        if (err) {
            res.status(500).send('Error deleting data.');
            return;
        }

        res.send('Data deleted successfully.');
    });
});

app.get('/see-all-data.html', function(req, res) {
    var sql = 'SELECT st.studentId, st.gender, g.tenthPercent, g.twelfthPercent, g.undergradPercent, g.MBAPercent, emp.workExperience, emp.employabilityTest, sch.schoolName, sch.schoolCity, uf.fieldName, mba.specName as MBASpecName, tw.specName as twelfthSpecName FROM Students st JOIN Grades g ON st.studentId = g.studentId JOIN EmpStats emp ON st.studentId = emp.studentId JOIN School sch ON st.schoolId = sch.schoolId JOIN UndergradFields uf ON st.undergradFieldId = uf.fieldId JOIN MBASpecializations mba ON st.MBASpecId = mba.specId JOIN TwelfthSpecializations tw ON st.twelfthSpecId = tw.specId'
    connection.query(sql, function(err, results) {
        if (err) {
            // Handle the error, e.g., send an error response to the frontend
            res.status(500).send('Error retrieving data from the database');
            return;
        }

        res.render('see-all-data', { data: results });
    });
});


app.get('/overall-stats.html', function(req, res) {
    var sql = 'SELECT * FROM OverallStats'; // Fixed the SQL query
    connection.query(sql, function(err, results) {
        if (err) {
            // Handle the error, e.g., send an error response to the frontend
            res.status(500).send('Error retrieving data from the database');
            return;
        }

        res.render('see-all-data', { data: results });
    });
});


app.route('/search-data.html')
        .get(function(req, res) {
        // Render the search-data.html page for GET requests
        res.render('search-data');
        })
        .post(function(req, res) {
    const studentId = req.body.studentId;

    // Validate that studentId is an integer
    if (!/^\d+$/.test(studentId)) {
        res.status(400).send('Invalid student ID. Please enter a valid integer.');
        return;
    }

    var sql = `SELECT * FROM Students WHERE studentId LIKE '%${studentId}%'`;

    connection.query(sql, function (err, results) {
        if (err) {
            res.status(500).send('Error retrieving data from the database');
            return;
        }

        // Render an HTML fragment with the search results
        res.render('search-results-fragment', { data: results, studentId: studentId }, function (err, html) {
            if (err) {
                res.status(500).send('Error rendering search results');
                return;
            }

            // Send the HTML fragment as the response
            res.send(html);
        });
    });
});

app.route('/enter-goal-salary.html')
        .get(function(req, res) {
        // Render the search-data.html page for GET requests
        res.render('enter-goal-salary');
        })
        .post(function(req, res) {
    const studentId = req.body.studentId;

    // Validate that studentId is an integer
    if (!/^\d+$/.test(studentId)) {
        res.status(400).send('Invalid salary. Please enter a valid integer.');
        return;
    }

    var sql = `CALL GetSpecializationsBySalary(${studentId})`;
    connection.query(sql, function (err, results) {
        if (err) {
            res.status(500).send('Error retrieving data from the database');
            return;
        }

        // Render an HTML fragment with the search results
        res.render('goal-salary-fragment', { data: results, studentId: studentId }, function (err, html) {
            if (err) {
                res.status(500).send('Error rendering search results');
                return;
            }

            // Send the HTML fragment as the response
            res.send(html);
        });
    });
});

app.route('/enter-undergrad-field.html')
    .get(function (req, res) {
        // Render the enter-undergrad-field.html page for GET requests
        res.render('enter-undergrad-fields');
    })
    .post(function (req, res) {
        const undergradField = req.body.undergradField;

        // Validate that undergradField is provided
        if (!undergradField) {
            res.status(400).send('Please enter your undergraduate field.');
            return;
        }

        var sql = `SELECT
    uf.fieldName AS SelectedDegree,
    AVG(p.salary) AS AvgSalary,
    MIN(p.salary) AS MinSalary,
    MAX(p.salary) AS MaxSalary,
    (
        SELECT ms.specName
        FROM MBASpecializations AS ms
        WHERE ms.specId IN (
            SELECT s.MBASpecId
            FROM Students s
            WHERE s.undergradFieldId = uf.fieldId
        )
        GROUP BY ms.specName
        ORDER BY COUNT(*) DESC
        LIMIT 1
    ) AS ModeSpecialization
FROM
    Students AS s
    LEFT JOIN UndergradFields uf ON s.undergradFieldId = uf.fieldId
    LEFT JOIN Placements AS p ON s.studentId = p.studentId
WHERE
    uf.fieldName = '${undergradField}'
GROUP BY
    uf.fieldName, ModeSpecialization`;

        connection.query(sql, function (err, results) {
            if (err) {
                res.status(500).send('Error retrieving data from the database');
                return;
            }
            // Render an HTML fragment with the search results
            res.render('undergrad-field-results-fragment', { data: results, undergradField: undergradField }, function (err, html) {
                if (err) {
                    res.status(500).send('Error rendering search results');
                    return;
                }

                // Send the HTML fragment as the response
                res.send(html);
            });
        });
    });

// Update data route
app.post('/update-data.html', function (req, res) {
    const { studentId, gender, schoolId, tenthBoardId, twelfthBoardId, twelfthSpecId, undergradFieldId, mbaspecId } = req.body;

    // Update data in the Students table
    const updateSql = `
        UPDATE Students
        SET gender = ?, schoolId = ?, tenthBoardId = ?, twelfthBoardId = ?,
            twelfthSpecId = ?, undergradFieldId = ?, MBASpecId = ?
        WHERE studentId = ?`;

    connection.query(
        updateSql,
        [gender, schoolId, tenthBoardId, twelfthBoardId, twelfthSpecId, undergradFieldId, mbaspecId, studentId],
        function (err, result) {
            if (err) {
                res.status(500).send('Error updating data.');
                return;
            }

            res.send('Data updated successfully.');
        }
    );
});

app.post('/insert-data.html', function (req, res) {
    const { studentId, gender, schoolId, tenthBoardId, twelfthBoardId, twelfthSpecId, undergradFieldId, mbaspecId } = req.body;

    // Insert data into the Students table
    const insertSql = `
        INSERT INTO Students (studentId, gender, schoolId, tenthBoardId, twelfthBoardId, twelfthSpecId, undergradFieldId, MBASpecId)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

    connection.query(
        insertSql,
        [studentId, gender, schoolId, tenthBoardId, twelfthBoardId, twelfthSpecId, undergradFieldId, mbaspecId],
        function (err, result) {
            if (err) {
                res.status(500).send('Error inserting data.');
                return;
            }

            res.send('Data inserted successfully.');
        }
    );
});

app.post('/delete-data', function (req, res) {
    const studentId = req.body.studentId;

    // Delete data from the Students table
    const deleteSql = 'DELETE FROM Students WHERE studentId = ?';

    connection.query(deleteSql, [studentId], function (err, result) {
        if (err) {
            res.status(500).send('Error deleting data.');
            return;
        }

        res.send('Data deleted successfully.');
    });
});


app.listen(80, function () {
    console.log('Node app is running on port 80');
});
