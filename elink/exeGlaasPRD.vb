' AXIS ELink Script: Submit GlaaS batch by batch number with debugging and comments

' Parameters - replace with your actual values or parameterize for automation
Dim datasetPath As String = "C:\AxisData\MyDataset"     ' Logical dataset path (should be accessible by farm nodes)
Dim datasetName As String = "MyDatasetName"             ' Dataset name in AXIS
Dim farmName As String = "TargetFarm"                   ' GridLink farm name configured in AXIS environment
Dim batchNumber As Integer = 12345                      ' Batch number to submit

' Optional execution parameters - customize as needed for environment
Dim cores As Integer = 4                                 ' Number of CPU cores requested for the job
Dim queues As Integer = 1                                ' Number of queues to reserve
Dim maxRunTimeMinutes As Integer = 0                     ' 0 means no max runtime enforced
Dim startProvisioning As Boolean = True                  ' Whether to start provisioning immediately
Dim description As String = "Automated batch submission" ' Job run description for logging/audit
Dim priority As Integer = 0                               ' Job priority (0=default)

Try
    ' Convert logical path to physical path for farm nodes
    Dim physicalPath As String = App.PathLogicalToPhysical(datasetPath)

    ' Instantiate dataset object with logical path and dataset name
    Dim myDataset As New Dataset(datasetPath, datasetName)

    ' Debug: Output dataset info
    Console.WriteLine("Dataset Name: " & myDataset.Name)
    Console.WriteLine("Dataset Logical Path: " & myDataset.Path)
    Console.WriteLine("Dataset Physical Path (resolved): " & physicalPath)

    ' Submit batch job by batch number using the correct API call
    Dim myJob As GlaaSJob = GlaaSJob.SubmitBatchToGlaaSById(
        myDataset.Name,          ' Dataset name (string)
        physicalPath,            ' Physical dataset path (string)
        batchNumber,             ' Batch number to submit (integer)
        farmName,                ' Target farm (string)
        cores,                   ' Number of cores (integer)
        queues,                  ' Number of queues (integer)
        maxRunTimeMinutes,       ' Maximum runtime in minutes (integer)
        startProvisioning,       ' Start provisioning now (boolean)
        description,             ' Job description (string)
        priority                 ' Job priority (integer)
    )

    ' Debug: Output job submission confirmation and job details
    Console.WriteLine("Batch submission successful.")
    Console.WriteLine("Job Info: " & myJob.ToString())

Catch ex As Exception
    ' Log and output any errors for debugging
    Console.WriteLine("ERROR: Batch submission failed.")
    Console.WriteLine("Exception Message: " & ex.Message)
    Console.WriteLine("Stack Trace: " & ex.StackTrace)
    ' Optionally: re-throw or handle exception according to your error policy
End Try
