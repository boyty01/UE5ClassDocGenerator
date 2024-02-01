# WIP

This program is WIP - It is designed to be integrated with a larger system that generates documentation for unreal engine project source code.  It should be considered non-functional and is not yet fit for production.  This is a pet project that spawned due to a personal requirement to keep tabs on my own source code and will remain free for anybody to fork and customise / improve on at their lesiure. Go nuts. 

## UE5 Class Parser

This module is designed to scower through a specified directory structure and parse any .h files that are found. It is built to recognise specific Unreal Engine C++ macros such as UCLASS, UPROPERTY and UFUNCTION and will construct objects based on the presence of these macros.
The parser uses a common state machine setup to detect where it is along a particular .h file and build the objects appropriately. Properties and Functions are paired with the current class being parsed and are saved out to a JSON structure at the end of the class, to be manipulated for whatever use is required.  

## Currently supported macros

### Container types
- UCLASS

### Member types
- UFUNCTION
- UPROPERTY

## Debug info
Since this is still WIP, there are issues where the parser can fail to recognise certain values within different states. To avoid the app crashing, the state machine handles failures by moving corrupt containers to the FailLogger which is then dumped to a file for debugging. If you find certain objects are missing from your data, check the fail dump for the partial objects to help narrow down what's causing the issue.  Typically, this just requires the function to be updated to cater for additional patterns that the existing regex is failing to encompass.  Hopefully, as time goes on, these issues will be reduced down to extremely small edge cases.
