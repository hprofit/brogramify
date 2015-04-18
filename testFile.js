angular.module('mgh.flex.classroom_dashboard', [
    'ui.router',
    'mgh.service.ClassroomService',
    'mgh.service.StudentService',
    'mgh.service.DateUtilService',
    'mgh.service.UtilService',
    'mgh.service.LessonService',
    'mgh.models.Student',
    'mgh.models.Lesson',
    'dialogs'
])
    .controller("ClassroomDashboardController", ['$scope', 'activeClassroom', 'studentsInClass', 'ClassroomService', 'StudentService', '$dialogs', '$state',
        function ($scope, activeClassroom, studentsInClass, ClassroomService, StudentService, $dialogs, $state) {
            $scope.activeClassroom = angular.copy(activeClassroom);
            $scope.students = studentsInClass;
            $scope.studentData = null;

            $scope.orderResultsByField = $scope.orderByField = 'lastName';
            $scope.reverseSortResults = $scope.reverseSort = false;

            $scope.handleStudentPasswordResponse = function (response) {
                if ($scope.studentData !== null) {
                    $dialogs.passwordDetails($scope.studentData.first_name + ' ' + $scope.studentData.last_name, response.username, response.password, activeClassroom.classroom_id, $scope.studentData.student_id);
                }
            };

            $scope.showPasswordPopup = function (studentData) {
                $scope.studentData = studentData;
                StudentService.getStudentPassword(studentData.student_id).then($scope.handleStudentPasswordResponse);
            };

            $scope.printPasswords = function () {
                if ($scope.students.length !== 0) {
                    ClassroomService.getClassPasswordCards($scope.activeClassroom.classroom_id);
                }
                else {
                    $dialogs.error("No students!", {errorMessages: {msg: 'There are no students in this class!'}});
                }
            };

            $scope.handleRemoveStudentResponse = function () {
                $state.go('app.classroom', {selectedClassroom: $scope.activeClassroom.classroom_id}, {
                    reload: true,
                    inherit: true
                });
            };

            $scope.removeStudent = function () {
                if ($scope.studentData !== null) {
                    ClassroomService.removeStudent($scope.activeClassroom.classroom_id, $scope.studentData.student_id).then($scope.handleRemoveStudentResponse);
                }
            };

            $scope.removeStudentDialog = function (studentData) {
                $scope.studentData = studentData;
                $dialogs.warning('Warning', 'Clicking Continue will remove ' + studentData.first_name + ' ' + studentData.last_name + ' from the class', $scope.removeStudent);
            };

            $scope.handleDeleteClassroomResponse = function (response) {
                $state.go('app', {}, {reload: true, inherit: false, notify: true});
            };

            $scope.deleteClassroom = function () {
                ClassroomService.deleteClassroom(activeClassroom.classroom_id).then($scope.handleDeleteClassroomResponse);
            };

            $scope.removeClassDialog = function () {
                $dialogs.warning('Remove Class?',
                    'Clicking Continue will remove ' + activeClassroom.name,
                    $scope.deleteClassroom);
            };
        }
    ])

    .controller("ClassroomCreateController", ['$scope', 'ClassroomService', 'Utils', 'DateUtil', '$dialogs', '$state',
        function ($scope, ClassroomService, Utils, DateUtil, $dialogs, $state) {
            $scope.newClassroomForm = {
                classroom_id: 0,
                name: "",
                start_date: null,
                end_date: null,
                scheduleState: [
                    {day: 'M', nonClassDay: false},
                    {day: 'Tu', nonClassDay: false},
                    {day: 'W', nonClassDay: false},
                    {day: 'Th', nonClassDay: false},
                    {day: 'F', nonClassDay: false}
                ],
                benchmarkTestsEnabled: "false",
                benchmark_test_date_1: null,
                benchmark_test_date_2: null,
                benchmark_test_date_3: null,
                school_id: 1
            };
            $scope.minStartDate = DateUtil.addDays(new Date(), -365);
            $scope.minEndDate = DateUtil.addDays(new Date(), 30);
            $scope.maxEndDate = DateUtil.addDays(new Date(), 365);
            $scope.endDisabled = true;
            $scope.benchDisabled = true;

            $scope.$watch('newClassroomForm.start_date', function (newValue) {
                if (newValue) {
                    $scope.endDisabled = false;
                    newValue = DateUtil.toDate(newValue);
                    $scope.minEndDate = DateUtil.addDays(newValue, 30);
                    $scope.maxEndDate = DateUtil.addDays(newValue, 365);
                }
            });

            $scope.$watch('newClassroomForm.end_date', function (newValue) {
                if (newValue) {
                    $scope.benchDisabled = false;
                }
            });

            $scope.makeDates = function (form) {
                form.start_date = DateUtil.toDate(form.start_date);
                form.end_date = DateUtil.toDate(form.end_date);
                form.benchmark_test_date_1 = DateUtil.toDate(form.benchmark_test_date_1);
                form.benchmark_test_date_2 = DateUtil.toDate(form.benchmark_test_date_2);
                form.benchmark_test_date_3 = DateUtil.toDate(form.benchmark_test_date_3);
                return form;
            };

            $scope.validateForm = function (form) {
                form = $scope.makeDates(angular.copy(form));
                var errorMessages = {},
                    totalClassDays = Math.abs(form.start_date - form.end_date);

                errorMessages.name = $scope.validateName(form.name);
                errorMessages.datesExist = $scope.validateDatesExist(form.start_date, form.end_date, form.benchmark_test_date_1, form.benchmark_test_date_2, form.benchmark_test_date_3);
                if (!errorMessages.datesExist) {
                    errorMessages.classDays = $scope.validateClassDays(DateUtil.millisToDays(totalClassDays));
                    errorMessages.startEndDates = $scope.validateStartAndEndDates(form.start_date, form.end_date);
                    errorMessages.benchmarkDates = $scope.validateBenchMarkDates(form.start_date, form.benchmark_test_date_1, form.benchmark_test_date_2, form.benchmark_test_date_3, form.end_date);
                }

                errorMessages = Utils.deleteEmptyFields(errorMessages);
                if (!Utils.isObjEmpty(errorMessages)) {
                    return {errorMessages: errorMessages};
                }
                else {
                    return {};
                }
            };

            $scope.validateName = function (name) {
                return !name ? 'Class must have a name!' : name.length > 50 ? 'Class name cannot exceed 50 characters!' : '';
            };

            $scope.validateDatesExist = function (d1, d2, d3, d4, d5) {
                if (!d1 || !d2 || !d3 || !d4 || !d5) {
                    return 'One or more dates missing! All dates must be filled out!';
                }
                else {
                    return '';
                }
            };

            $scope.validateClassDays = function (totalClassDays) {
                return totalClassDays > 365 ? "Total class length cannot exceed 365 days!" : totalClassDays === 0 ? "Start date and end date cannot be the same!" : '';
            };

            $scope.validateStartAndEndDates = function (start, end) {
                return start >= end ? "Start date must be before the end date!" : '';
            };

            $scope.validateBenchMarkDates = function (start, bench1, bench2, bench3, end) {
                var first = DateUtil.isBetweenDates(bench1, DateUtil.addDays(start, 1), bench2),
                    second = DateUtil.isBetweenDates(bench2, bench1, bench3),
                    third = DateUtil.isBetweenDates(bench3, bench2, DateUtil.addDays(end, 1));
                if (!first || !second || !third) {
                    return "Test dates must be in chronological order and within the class start and end dates!";
                }
                return '';
            };

            $scope.handleCreateResponse = function (response) {
                $state.go('app.classroom', {selectedClassroom: response}, {reload: true, inherit: true});
            };

            $scope.saveClassroom = function (classroomForm) {
                var result = $scope.validateForm(classroomForm);
                if (result.errorMessages) {
                    $dialogs.error("Error!", result);
                }
                else {
                    ClassroomService.createClassroom(classroomForm).then($scope.handleCreateResponse);
                }
            };
        }
    ])

    .config(['$stateProvider', function ($stateProvider) {
        $stateProvider
            .state('app.classroom', {
                url: 'classroom/:selectedClassroom',

                resolve: {
                    // classroomList is a dependency that must be loaded before getCurrentClassroom is called
                    activeClassroom: ['ClassroomService', '$stateParams', 'classroomList', function (ClassroomService, $stateParams, classroomList) {
                        ClassroomService.setCurrentClassroom($stateParams.selectedClassroom);
                        return ClassroomService.getCurrentClassroom();
                    }],
                    // activeClassroom is a dependency that must be loaded before getClassroomStudents is called
                    studentsInClass: ['ClassroomService', 'activeClassroom', function (ClassroomService, activeClassroom) {
                        return ClassroomService.getClassroomStudents(activeClassroom.classroom_id);
                    }]
                },

                views: {
                    'content@': {
                        templateUrl: '/flex/static/templates/teacher/classroom/classroom_dashboard.html',
                        controller: 'ClassroomDashboardController'
                    }
                }
            })

            .state('app.classform', {
                url: 'classform'
            })

            .state('app.classform.create', {
                url: '/create',

                views: {
                    'content@': {
                        templateUrl: '/flex/static/templates/teacher/classroom/classroom_create.html',
                        controller: 'ClassroomCreateController'
                    }
                }
            });
    }]);
