# WIP

This program is WIP - It is designed to be integrated with a larger system that generates documentation for unreal engine project source code.  It should be considered non-functional and is not yet fit for production.  This is a pet project that spawned due to a personal requirement to keep tabs on my own source code and will remain free for anybody to fork and customise / improve on at their lesiure. Go nuts. 

## UE5 Class Parser

This module is designed to scower through a specified directory and parse any .h files that are found. It is built to recognise specific Unreal Engine C++ macros such as UCLASS, UPROPERTY and UFUNCTION and will construct objects based on the presence of these macros.
The parser uses a common state machine setup to detect where it is along a particular .h file and build the objects appropriately. Properties and Functions are paired with the current class being parsed and are saved out to a JSON structure at the end of the class, to be manipulated for whatever use is required.  

## Currently supported macros

### Container types
- UCLASS

### Member types
- UFUNCTION
- UPROPERTY
